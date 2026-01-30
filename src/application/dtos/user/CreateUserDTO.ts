import type { DomainUserRole } from '@domain/entities/User';


export interface CreateUserDTO {
  email: string;
  name: string;
  role: DomainUserRole;
}

export class CreateUserDTOValidator {
  static validate(dto: CreateUserDTO): { isValid: boolean; errors: Record<string, string[]> } {
    const errors: Record<string, string[]> = {};
    const allowedRoles: DomainUserRole[] = ['customer', 'tour-guide', 'admin'];


    if (!dto.email || dto.email.trim().length === 0) {
      errors.email = ['Email is required'];
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dto.email)) {
        errors.email = ['Invalid email format'];
      }
    }

    if (!dto.name || dto.name.trim().length === 0) {
      errors.name = ['Name is required'];
    }

    if (!dto.role || !allowedRoles.includes(dto.role)) {
      errors.role = ['Role must be either "customer" or "admin"'];
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
