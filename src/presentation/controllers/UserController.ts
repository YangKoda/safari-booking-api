import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from '@infrastructure/database/repositories/implementations/PrismaUserRepository';
import { CreateUserDTO, CreateUserDTOValidator } from '@application/dtos/user/CreateUserDTO';
import { ValidationError } from '@shared/errors';
import { User } from '@domain/entities/User';
import { Email } from '@domain/value-objects/Email';
import * as bcrypt from 'bcrypt';

export class UserController {
  private prisma: PrismaClient;
  private userRepository: PrismaUserRepository;

  constructor() {
    this.prisma = new PrismaClient();
    this.userRepository = new PrismaUserRepository(this.prisma);
  }

  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreateUserDTO = {
        email: req.body.email,
        name: req.body.name,
        role: req.body.role,
      };

      // Validate DTO at presentation boundary
      const validation = CreateUserDTOValidator.validate(dto);
      if (!validation.isValid) {
        throw new ValidationError('User validation failed', validation.errors);
      }

      // Hash default password for new safari booking customers
      const defaultPassword = await bcrypt.hash('SafariBooking2026!', 12);

      // Create domain entity
      const user = new User({
        id: crypto.randomUUID(),
        name: dto.name,
        email: new Email(dto.email),
        password: defaultPassword,
        role: dto.role,
        active: true,
      });

      // Persist via repository
      const result = await this.userRepository.save(user);

      res.status(201).json({
        status: 'success',
        data: {
          id: result.getId(),
          name: result.getName(),
          email: result.getEmail().getValue(),
          role: result.getRole(),
          active: result.isActive(),
          createdAt: result.getCreatedAt(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const user = await this.userRepository.findById(id);

      if (!user) {
        res.status(404).json({
          status: 'error',
          message: 'Safari booking user not found',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: {
          id: user.getId(),
          name: user.getName(),
          email: user.getEmail().getValue(),
          role: user.getRole(),
          photo: user.getPhoto(),
          phone: user.getPhone(),
          active: user.isActive(),
          createdAt: user.getCreatedAt(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.userRepository.findAll();

      const mappedUsers = users.map(user => ({
        id: user.getId(),
        name: user.getName(),
        email: user.getEmail().getValue(),
        role: user.getRole(),
        photo: user.getPhoto(),
        active: user.isActive(),
        createdAt: user.getCreatedAt(),
      }));

      res.status(200).json({
        status: 'success',
        results: mappedUsers.length,
        data: mappedUsers,
      });
    } catch (error) {
      next(error);
    }
  };
}
