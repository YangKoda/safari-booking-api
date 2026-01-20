import { Request, Response, NextFunction } from 'express';
import { prisma } from '@infrastructure/database/prisma-client';
import { PrismaTourRepository } from '@infrastructure/database/repositories/implementations/PrismaTourRepository';
import { CreateTourDTO, CreateTourDTOValidator } from '@application/dtos/tour/CreateTourDTO';
import { CreateTourUseCase } from '@application/use-cases/tour/CreateTourUseCase';
import { GetTourUseCase } from '@application/use-cases/tour/GetTourUseCase';
import { ListToursUseCase } from '@application/use-cases/tour/ListToursUseCase';
import { ValidationError } from '@shared/errors';

export class TourController {
  private tourRepository: PrismaTourRepository;

  constructor() {
    this.tourRepository = new PrismaTourRepository(prisma);
  }

  createTour = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreateTourDTO = {
        name: req.body.name,
        description: req.body.description,
        duration: Number(req.body.duration),
        maxGroupSize: Number(req.body.maxGroupSize),
        difficulty: req.body.difficulty,
        priceAmount: Number(req.body.priceAmount),
        priceCurrency: req.body.priceCurrency || 'USD',
        summary: req.body.summary,
        imageCover: req.body.imageCover,
        images: req.body.images || [],
        startDates: req.body.startDates || [],
        startLocation: req.body.startLocation,
        locations: req.body.locations || [],
        guides: req.body.guides || [],
      };

      // Validate DTO before passing to use case
      const validation = CreateTourDTOValidator.validate(dto);
      if (!validation.isValid) {
        throw new ValidationError('Tour validation failed', validation.errors);
      }

      const useCase = new CreateTourUseCase(this.tourRepository);
      const result = await useCase.execute(dto);

      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getTour = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);

      const useCase = new GetTourUseCase(this.tourRepository);
      const result = await useCase.execute(id);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  listTours = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const useCase = new ListToursUseCase(this.tourRepository);
      const result = await useCase.execute();

      res.status(200).json({
        status: 'success',
        results: result.length,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
