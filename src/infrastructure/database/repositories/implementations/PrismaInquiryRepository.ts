import { PrismaClient, InquiryStatus as PrismaInquiryStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

import { Inquiry } from '@domain/entities/Inquiry';
import { IInquiryRepository } from '@domain/repositories/IInquiryRepository';

import { InquiryMapper } from '../mappers/InquiryMapper';
import { NotFoundError } from '@shared/errors';

export class PrismaInquiryRepository implements IInquiryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // -------------------
  // Create
  // -------------------
  async save(inquiry: Inquiry): Promise<Inquiry> {
    // ⚡ If inquiry has id, upsert; else create new record
    const id = inquiry.getId();

    const dateRange = inquiry.getPreferredDateRange();

    const data = {
      tourId: inquiry.getTourId(),
      userId: inquiry.getUserId() || null,

      customerName: inquiry.getCustomerName(),
      customerEmail: inquiry.getCustomerEmail(),
      phone: inquiry.getCustomerPhone() || null,

      numberOfPeople: inquiry.getParticipants(),

      preferredStartDate: dateRange.getStartDate(),
      preferredEndDate: dateRange.getEndDate(),

      totalPrice: new Prisma.Decimal(inquiry.getTotalPrice().getAmount()),
      currency: inquiry.getTotalPrice().getCurrency(),

      specialRequests: inquiry.getSpecialRequests() || null,
      status: inquiry.getStatus().toUpperCase() as PrismaInquiryStatus,
    };

    const saved = id
      ? await this.prisma.inquiry.upsert({
          where: { id },
          create: { id, ...data },
          update: { ...data },
        })
      : await this.prisma.inquiry.create({ data });

    return InquiryMapper.toDomain(saved);
  }

  // -------------------
  // Read
  // -------------------
  async findById(id: string): Promise<Inquiry | null> {
    const found = await this.prisma.inquiry.findUnique({ where: { id } });
    if (!found) return null;

    return InquiryMapper.toDomain(found);
  }

  async findByUserId(userId: string): Promise<Inquiry[]> {
    const results = await this.prisma.inquiry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return results.map((r) => InquiryMapper.toDomain(r));
  }

  async findByTourId(tourId: string): Promise<Inquiry[]> {
    const results = await this.prisma.inquiry.findMany({
      where: { tourId },
      orderBy: { createdAt: 'desc' },
    });

    return results.map((r) => InquiryMapper.toDomain(r));
  }

  async findByStatus(status: 'pending' | 'confirmed' | 'cancelled' | 'completed'): Promise<Inquiry[]> {
    const prismaStatus = status.toUpperCase() as PrismaInquiryStatus;

    const results = await this.prisma.inquiry.findMany({
      where: { status: prismaStatus },
      orderBy: { createdAt: 'desc' },
    });

    return results.map((r) => InquiryMapper.toDomain(r));
  }

  async findAll(): Promise<Inquiry[]> {
    const results = await this.prisma.inquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return results.map((r) => InquiryMapper.toDomain(r));
  }

  // -------------------
  // Update
  // -------------------
  async update(inquiry: Inquiry): Promise<Inquiry> {
    const id = inquiry.getId();
    if (!id) throw new Error('Inquiry ID is required for update');

    const exists = await this.findById(id);
    if (!exists) throw new NotFoundError(`Inquiry with ID ${id} not found`);

    const dateRange = inquiry.getPreferredDateRange();

    const updated = await this.prisma.inquiry.update({
      where: { id },
      data: {
        tourId: inquiry.getTourId(),
        userId: inquiry.getUserId() || null,

        customerName: inquiry.getCustomerName(),
        customerEmail: inquiry.getCustomerEmail(),
        phone: inquiry.getCustomerPhone() || null,

        numberOfPeople: inquiry.getParticipants(),

        preferredStartDate: dateRange.getStartDate(),
        preferredEndDate: dateRange.getEndDate(),

        totalPrice: new Prisma.Decimal(inquiry.getTotalPrice().getAmount()),
        currency: inquiry.getTotalPrice().getCurrency(),

        specialRequests: inquiry.getSpecialRequests() || null,
        status: inquiry.getStatus().toUpperCase() as PrismaInquiryStatus,
      },
    });

    return InquiryMapper.toDomain(updated);
  }

  // -------------------
  // Delete
  // -------------------
  async delete(id: string): Promise<void> {
    await this.prisma.inquiry.delete({ where: { id } });
  }

  // -------------------
  // Aggregations
  // -------------------
  async countInquiries(): Promise<number> {
    return this.prisma.inquiry.count();
  }

  async countByStatus(status: 'pending' | 'confirmed' | 'cancelled' | 'completed'): Promise<number> {
    const prismaStatus = status.toUpperCase() as PrismaInquiryStatus;

    return this.prisma.inquiry.count({
      where: { status: prismaStatus },
    });
  }

  async findUpcoming(): Promise<Inquiry[]> {
    const now = new Date();

    const results = await this.prisma.inquiry.findMany({
      where: {
        preferredStartDate: { gt: now },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      orderBy: { preferredStartDate: 'asc' },
    });

    return results.map((r) => InquiryMapper.toDomain(r));
  }
}
