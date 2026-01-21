import { Request, Response, NextFunction } from 'express';
import { PrismaInquiryRepository } from '@infrastructure/database/repositories/implementations/PrismaInquiryRepository';
import { PrismaTourRepository } from '@infrastructure/database/repositories/implementations/PrismaTourRepository';
import { CreateInquiryDTO, CreateInquiryDTOValidator } from '@application/dtos/inquiry/CreateInquiryDTO';
import { ValidationError } from '@shared/errors';
import { Inquiry } from '@domain/entities/Inquiry';
import { DateRange } from '@domain/value-objects/DateRange';
import { Money } from '@domain/value-objects/Money';
import { prisma } from '@infrastructure/database/prisma-client';
import Logger from '@shared/utils/logger';
import { NodemailerEmailService } from '@infrastructure/email/NodemailerEmailService';


export class InquiryController {
  private inquiryRepository: PrismaInquiryRepository;
  private tourRepository: PrismaTourRepository;
  private emailService: NodemailerEmailService;


constructor() {
  this.inquiryRepository = new PrismaInquiryRepository(prisma);
  this.tourRepository = new PrismaTourRepository(prisma);

  this.emailService = new NodemailerEmailService();
}

  createInquiry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreateInquiryDTO = {
        tourId: req.body.tourId,
        userId: req.body.userId,
        customerName: req.body.customerName,
        customerEmail: req.body.customerEmail,
        customerPhone: req.body.customerPhone,
        participants: Number(req.body.participants),
        preferredDateRange: new DateRange(
          new Date(req.body.startDate),
          new Date(req.body.endDate)
        ),
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        specialRequests: req.body.specialRequests,
      };

      // Validate DTO at presentation boundary
      const validation = CreateInquiryDTOValidator.validate(dto);
      if (!validation.isValid) {
        throw new ValidationError('Inquiry validation failed', validation.errors);
      }

      // Verify tour exists and get pricing
      const tour = await this.tourRepository.findById(dto.tourId);
      if (!tour) {
        throw new ValidationError('Tour not found', {
          tourId: ['The specified safari tour does not exist'],
        });
      }

      // Calculate total price from tour price * participants
      const tourPrice = tour.getPrice();
      const totalPrice = new Money(
        tourPrice.getAmount() * dto.participants,
        tourPrice.getCurrency()
      );

      // Create domain entity
      const inquiry = new Inquiry({
        id: crypto.randomUUID(),
        tourId: dto.tourId,
        userId: dto.userId,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        customerPhone: dto.customerPhone,
        participants: dto.participants,
        preferredDateRange: dto.preferredDateRange,
        totalPrice: totalPrice,
        specialRequests: dto.specialRequests,
        status: 'pending',
      });

      // Persist via repository
      const result = await this.inquiryRepository.save(inquiry);
      // Send inquiry received email (best-effort)
      try {
        await this.emailService.send({
          to: result.getCustomerEmail(),
          subject: 'We received your safari inquiry 📨',
          template: 'inquiry-received',
          variables: {
            customerName: result.getCustomerName(),
            tourName: tour.getName(),
            startDate: dto.startDate,
            endDate: dto.endDate,
            participants: dto.participants,
            totalAmount: result.getTotalPrice().getAmount(),
            currency: result.getTotalPrice().getCurrency(),
        },
      });

      Logger.info(`Inquiry received email sent → ${result.getCustomerEmail()} (inquiryId=${result.getId()})`);
    } catch (err: any) {
      Logger.error(`Inquiry received email FAILED → ${result.getCustomerEmail()}: ${err.message}`);
}



      res.status(201).json({
        status: 'success',
        data: {
          id: result.getId(),
          tourId: result.getTourId(),
          userId: result.getUserId(),
          customerName: result.getCustomerName(),
          customerEmail: result.getCustomerEmail(),
          customerPhone: result.getCustomerPhone(),
          participants: result.getParticipants(),
          preferredDateRange: {
            startDate: result.getPreferredDateRange().getStartDate(),
            endDate: result.getPreferredDateRange().getEndDate(),
          },
          totalPrice: {
            amount: result.getTotalPrice().getAmount(),
            currency: result.getTotalPrice().getCurrency(),
          },
          specialRequests: result.getSpecialRequests(),
          status: result.getStatus(),
          createdAt: result.getCreatedAt(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getInquiry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const inquiry = await this.inquiryRepository.findById(id);

      if (!inquiry) {
        res.status(404).json({
          status: 'error',
          message: 'Safari booking inquiry not found',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: {
          id: inquiry.getId(),
          tourId: inquiry.getTourId(),
          userId: inquiry.getUserId(),
          customerName: inquiry.getCustomerName(),
          customerEmail: inquiry.getCustomerEmail(),
          customerPhone: inquiry.getCustomerPhone(),
          participants: inquiry.getParticipants(),
          preferredDateRange: {
            startDate: inquiry.getPreferredDateRange().getStartDate(),
            endDate: inquiry.getPreferredDateRange().getEndDate(),
          },
          totalPrice: {
            amount: inquiry.getTotalPrice().getAmount(),
            currency: inquiry.getTotalPrice().getCurrency(),
          },
          specialRequests: inquiry.getSpecialRequests(),
          status: inquiry.getStatus(),
          createdAt: inquiry.getCreatedAt(),
          updatedAt: inquiry.getUpdatedAt(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  confirmInquiry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
    const id = String(req.params.id);
    const inquiry = await this.inquiryRepository.findById(id);

    if (!inquiry) {
      res.status(404).json({
        status: 'error',
        message: 'Safari booking inquiry not found',
      });
      return;
    }

    // Domain method for business logic
    inquiry.confirm();
    const result = await this.inquiryRepository.update(inquiry);

    // Fetch tour name (professional email content)
    const tour = await this.tourRepository.findById(result.getTourId());
    const tourName = tour ? tour.getName() : 'Safari Tour';

    // Send booking confirmation email (Best-effort: confirmation must NOT fail)
    try {
      const dateRange = result.getPreferredDateRange();

      await this.emailService.send({
        to: result.getCustomerEmail(),
        subject: 'Your Safari Booking is Confirmed ✅',
        template: 'booking-confirmation',
        variables: {
          customerName: result.getCustomerName(),
          tourName,
          startDate: dateRange.getStartDate().toISOString().split('T')[0],
          endDate: dateRange.getEndDate().toISOString().split('T')[0],
          participants: result.getParticipants(),
          totalAmount: result.getTotalPrice().getAmount(),
          currency: result.getTotalPrice().getCurrency(),
        },
      });

      Logger.info(`Booking confirmation email sent → ${result.getCustomerEmail()} (inquiryId=${id})`);
    } catch (emailError: any) {
      Logger.error(
        `Booking confirmation email FAILED → ${result.getCustomerEmail()} (inquiryId=${id}): ${emailError.message}`
      );
      // Important: Do NOT block confirmation if email fails
    }

    res.status(200).json({
      status: 'success',
      message: 'Safari booking confirmed successfully',
      data: {
        id: result.getId(),
        status: result.getStatus(),
        updatedAt: result.getUpdatedAt(),
      },
    });
  } catch (error) {
    next(error);
  }
};


  cancelInquiry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const inquiry = await this.inquiryRepository.findById(id);

      if (!inquiry) {
        res.status(404).json({
          status: 'error',
          message: 'Safari booking inquiry not found',
        });
        return;
      }

      // Use domain method for business logic
      inquiry.cancel();
      const result = await this.inquiryRepository.update(inquiry);

        //  Send cancellation email (best-effort)
      try {
        const tour = await this.tourRepository.findById(result.getTourId());
        const tourName = tour ? tour.getName() : 'Safari Tour';

        const dateRange = result.getPreferredDateRange();

        await this.emailService.send({
        to: result.getCustomerEmail(),
        subject: 'Your Safari Booking has been Cancelled ',
        template: 'booking-cancelled',
        variables: {
          customerName: result.getCustomerName(),
          tourName,
          startDate: dateRange.getStartDate().toISOString().split('T')[0],
          endDate: dateRange.getEndDate().toISOString().split('T')[0],
          participants: result.getParticipants(),
      },
    });

      Logger.info(`Cancellation email sent → ${result.getCustomerEmail()} (inquiryId=${id})`);
    } catch (emailError: any) {
      Logger.error(
    `Cancellation email FAILED → ${result.getCustomerEmail()} (inquiryId=${id}): ${emailError.message}`
    );
  }

      res.status(200).json({
        status: 'success',
        message: 'Safari booking cancelled successfully',
        data: {
          id: result.getId(),
          status: result.getStatus(),
          updatedAt: result.getUpdatedAt(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  listInquiries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const inquiries = await this.inquiryRepository.findAll();

      const mappedInquiries = inquiries.map(inquiry => ({
        id: inquiry.getId(),
        tourId: inquiry.getTourId(),
        userId: inquiry.getUserId(),
        customerName: inquiry.getCustomerName(),
        participants: inquiry.getParticipants(),
        preferredDateRange: {
          startDate: inquiry.getPreferredDateRange().getStartDate(),
          endDate: inquiry.getPreferredDateRange().getEndDate(),
        },
        totalPrice: {
          amount: inquiry.getTotalPrice().getAmount(),
          currency: inquiry.getTotalPrice().getCurrency(),
        },
        status: inquiry.getStatus(),
        createdAt: inquiry.getCreatedAt(),
      }));

      res.status(200).json({
        status: 'success',
        results: mappedInquiries.length,
        data: mappedInquiries,
      });
    } catch (error) {
      next(error);
    }
  };
}
