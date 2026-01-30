import { PrismaClient, UserRole as PrismaUserRole } from '@prisma/client';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User } from '@domain/entities/User';
import { Email } from '@domain/value-objects/Email';
import { NotFoundError } from '@shared/errors';
import { UserMapper } from '@infrastructure/database/repositories/mappers/UserMapper';
import type { DomainUserRole } from '@domain/entities/User';



/**
 * Domain roles:  'customer' | 'tour-guide' | 'admin'
 * Prisma roles:  USER | GUIDE | LEAD_GUIDE | ADMIN
 */
function toPrismaRole(role: DomainUserRole): PrismaUserRole {
  switch (role) {
    case 'customer':
      return PrismaUserRole.USER;
    case 'tour-guide':
      return PrismaUserRole.GUIDE;
    case 'admin':
      return PrismaUserRole.ADMIN;
    default:
      return PrismaUserRole.USER;
  }
}

function toDomainRole(role: PrismaUserRole): DomainUserRole {
  switch (role) {
    case PrismaUserRole.ADMIN:
      return 'admin';
    case PrismaUserRole.GUIDE:
    case PrismaUserRole.LEAD_GUIDE:
      return 'tour-guide';
    case PrismaUserRole.USER:
    default:
      return 'customer';
  }
}

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // -------------------
  // Create
  // -------------------
  async save(user: User): Promise<User> {
    const id = user.getId();

    // Prisma expects email as string
    const emailStr = user.getEmail().toString();

    const data = {
      name: user.getName(),
      email: emailStr,
      username: user.getUsername() || null,
      password: user.getPassword(),
      role: toPrismaRole(user.getRole()),
      photo: user.getPhoto() ?? null,
      phone: user.getPhone() ?? null,
      active: user.isActive(),
    };

    // If domain user has id -> upsert; else create
    const saved = id
      ? await this.prisma.user.upsert({
          where: { id },
          create: { id, ...data },
          update: { ...data },
        })
      : await this.prisma.user.create({ data });

    // Convert back to domain User
    return new User({
      id: saved.id,
      name: saved.name,
      email: new Email(saved.email),
      username: saved.username || undefined,
      password: saved.password,
      role: toDomainRole(saved.role),
      photo: saved.photo ?? undefined,
      phone: saved.phone ?? undefined,
      active: saved.active,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
      passwordChangedAt: saved.passwordChangedAt ?? undefined,
    });
  }

  // -------------------
  // Read
  // -------------------
  async findById(id: string): Promise<User | null> {
    const u = await this.prisma.user.findUnique({ where: { id } });
    if (!u) return null;

    return new User({
      id: u.id,
      name: u.name,
      email: new Email(u.email),
      username: u.username || undefined,
      password: u.password,
      role: toDomainRole(u.role),
      photo: u.photo ?? undefined,
      phone: u.phone ?? undefined,
      active: u.active,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      passwordChangedAt: u.passwordChangedAt ?? undefined,
    });
  }

  async findByEmail(email: Email): Promise<User | null> {
    const u = await this.prisma.user.findUnique({
      where: { email: email.toString() },
    });
    if (!u) return null;

    return new User({
      id: u.id,
      name: u.name,
      email: new Email(u.email),
      password: u.password,
      role: toDomainRole(u.role),
      photo: u.photo ?? undefined,
      phone: u.phone ?? undefined,
      active: u.active,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      passwordChangedAt: u.passwordChangedAt ?? undefined,
    });
  }

  async findByUsername(username: string): Promise<User | null> {
  const prismaUser = await this.prisma.user.findUnique({
    where: { username },
  });

  if (!prismaUser) {
    return null;
  }

  return UserMapper.toDomain(prismaUser);
}

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return users.map(
      (u) =>
        new User({
          id: u.id,
          name: u.name,
          email: new Email(u.email),
          password: u.password,
          role: toDomainRole(u.role),
          photo: u.photo ?? undefined,
          phone: u.phone ?? undefined,
          active: u.active,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        })
    );
  }

  async findByRole(role: DomainUserRole): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { role: toPrismaRole(role)  },
    });

    return users.map(UserMapper.toDomain);
  }

  async findActiveUsers(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });

    return users.map(
      (u) =>
        new User({
          id: u.id,
          name: u.name,
          email: new Email(u.email),
          password: u.password,
          role: toDomainRole(u.role),
          photo: u.photo ?? undefined,
          phone: u.phone ?? undefined,
          active: u.active,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        })
    );
  }

  // -------------------
  // Update
  // -------------------
  async update(user: User): Promise<User> {
    const id = user.getId();
    if (!id) throw new Error('User ID is required for update');

    const exists = await this.findById(id);
    if (!exists) throw new NotFoundError(`User with ID ${id} not found`);

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        name: user.getName(),
        email: user.getEmail().toString(),
        username: user.getUsername() || null,
        password: user.getPassword(),
        role: toPrismaRole(user.getRole()),
        photo: user.getPhoto() ?? null,
        phone: user.getPhone() ?? null,
        active: user.isActive(),
        passwordChangedAt: user.getPasswordChangedAt() ?? null,
      },
    });

    return new User({
      id: updated.id,
      name: updated.name,
      email: new Email(updated.email),
      username: updated.username || undefined,
      password: updated.password,
      role: toDomainRole(updated.role),
      photo: updated.photo ?? undefined,
      phone: updated.phone ?? undefined,
      active: updated.active,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      passwordChangedAt: updated.passwordChangedAt ?? undefined,
    });
  }

  // -------------------
  // Delete
  // -------------------
  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  // -------------------
  // Aggregations
  // -------------------
  async countUsers(): Promise<number> {
    return this.prisma.user.count();
  }

  async countByRole(role: DomainUserRole): Promise<number> {
    return this.prisma.user.count({
      where: {  role: toPrismaRole(role)  },
    });
  }
}
