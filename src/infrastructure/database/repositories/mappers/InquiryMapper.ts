import { Inquiry, InquiryProps, InquiryStatus as DomainInquiryStatus } from '@domain/entities/Inquiry';
import { DateRange } from '@domain/value-objects/DateRange';
import { Money } from '@domain/value-objects/Money';
import { Inquiry as PrismaInquiry, InquiryStatus as PrismaInquiryStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

export class InquiryMapper {
  static toDomain(prisma: PrismaInquiry): Inquiry {
    const endDate = new Date(prisma.preferredDate);
    endDate.setDate(endDate.getDate() + 7);

    const inquiryProps: InquiryProps = {
      id: prisma.id,
      tourId: prisma.tourId,
      userId: prisma.userId || '',
      customerName: prisma.customerName,
      customerEmail: prisma.customerEmail,
      customerPhone: prisma.phone || '',
      participants: prisma.numberOfPeople,
      preferredDateRange: new DateRange(prisma.preferredDate, endDate),
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
      preferredDate: inquiry.getPreferredDateRange().getStartDate(),
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
