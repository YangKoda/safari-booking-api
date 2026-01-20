import { Inquiry, InquiryProps, InquiryStatus as DomainInquiryStatus } from '@domain/entities/Inquiry';
import { DateRange } from '@domain/value-objects/DateRange';
import { Money } from '@domain/value-objects/Money';
import { Inquiry as PrismaInquiry, InquiryStatus as PrismaInquiryStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

export class InquiryMapper {
  static toDomain(prisma: PrismaInquiry): Inquiry {

    const inquiryProps: InquiryProps = {
      id: prisma.id,
      skipPastDateValidation: true,
      tourId: prisma.tourId,
      userId: prisma.userId || '',
      customerName: prisma.customerName,
      customerEmail: prisma.customerEmail,
      customerPhone: prisma.phone || '',
      participants: prisma.numberOfPeople,

      preferredDateRange: new DateRange(
        new Date(prisma.preferredStartDate),
        new Date(prisma.preferredEndDate),
        true
      ),

      totalPrice: new Money(Number(prisma.totalPrice), prisma.currency),
      specialRequests: prisma.specialRequests || undefined,
      status: this.mapStatusToDomain(prisma.status),
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    };

    return new Inquiry(inquiryProps);
  }

  static toPrisma(inquiry: Inquiry): Omit<PrismaInquiry, 'createdAt' | 'updatedAt'> {
    const inquiryId = inquiry.getId();
    if (!inquiryId) throw new Error('Inquiry ID required for Prisma conversion');

    return {
      id: inquiryId,
      tourId: inquiry.getTourId(),
      userId: inquiry.getUserId() || null,
      customerName: inquiry.getCustomerName(),
      customerEmail: inquiry.getCustomerEmail(),
      phone: inquiry.getCustomerPhone() || null,
      numberOfPeople: inquiry.getParticipants(),

      preferredStartDate: inquiry.getPreferredDateRange().getStartDate(),
      preferredEndDate: inquiry.getPreferredDateRange().getEndDate(),

      status: this.mapStatusToPrisma(inquiry.getStatus()),
      totalPrice: new Prisma.Decimal(inquiry.getTotalPrice().getAmount()),
      currency: inquiry.getTotalPrice().getCurrency(),
      specialRequests: inquiry.getSpecialRequests() || null,
    };
  }

  private static mapStatusToDomain(prismaStatus: PrismaInquiryStatus): DomainInquiryStatus {
    return prismaStatus.toLowerCase() as DomainInquiryStatus;
  }

  private static mapStatusToPrisma(domainStatus: DomainInquiryStatus): PrismaInquiryStatus {
    return domainStatus.toUpperCase() as PrismaInquiryStatus;
  }
}
