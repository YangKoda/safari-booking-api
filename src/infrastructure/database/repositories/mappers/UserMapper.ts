import { User, UserProps, UserRole as DomainUserRole } from '@domain/entities/User';
import { Email } from '@domain/value-objects/Email';
import { User as PrismaUser, UserRole as PrismaUserRole } from '@prisma/client';

export class UserMapper {
  /**
   * Convert Prisma User model to Domain User entity
   */
  static toDomain(prisma: PrismaUser): User {
    const userProps: UserProps = {
      id: prisma.id,
      name: prisma.name,
      email: new Email(prisma.email),
      role: this.mapRoleToDomain(prisma.role),
      password: prisma.password,
      active: prisma.active,
      photo: prisma.photo || undefined,
      phone: prisma.phone || undefined,
    };

    return new User(userProps);
  }

  /**
   * Convert Domain User entity to Prisma User data
   */
  static toPrisma(user: User): Omit<PrismaUser, 'createdAt' | 'updatedAt'> {
    return {
      id: user.getId() || '',
      name: user.getName(),
      email: user.getEmail().getValue(),
      role: this.mapRoleToPrisma(user.getRole()),
      password: user.getPassword(),
      active: user.isActive(),
      photo: user.getPhoto() || null,
      phone: user.getPhone() || null,
    };
  }

  /**
   * Map Prisma UserRole to Domain UserRole
   */
  private static mapRoleToDomain(prismaRole: PrismaUserRole): DomainUserRole {
    switch (prismaRole) {
      case 'ADMIN':
        return 'admin';
      case 'GUIDE':
        return 'tour-guide';
      case 'USER':
        return 'customer';
      default:
        return 'customer';
    }
  }

  /**
   * Map Domain UserRole to Prisma UserRole
   */
  private static mapRoleToPrisma(domainRole: DomainUserRole): PrismaUserRole {
    switch (domainRole) {
      case 'admin':
        return 'ADMIN';
      case 'tour-guide':
        return 'GUIDE';
      case 'customer':
        return 'USER';
      default:
        return 'USER';
    }
  }
}
