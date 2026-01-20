import { Request, Response, NextFunction } from 'express';
import { prisma } from '@infrastructure/database/prisma-client';
import { PrismaTourRepository } from '@infrastructure/database/repositories/implementations/PrismaTourRepository';
import { CreateTourDTO, CreateTourDTOValidator } from '@application/dtos/tour/CreateTourDTO';
import { CreateTourUseCase } from '@application/use-cases/tour/CreateTourUseCase';
import { GetTourUseCase } from '@application/use-cases/tour/GetTourUseCase';
import { ListToursUseCase } from '@application/use-cases/tour/ListToursUseCase';
import { ValidationError } from '@shared/errors';
import { SearchToursUseCase } from '@application/use-cases/tour/SearchToursUseCase';
import { SearchToursDTO } from '@application/dtos/tour/SearchToursDTO';


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

searchTours = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dto: SearchToursDTO = {
      query: req.query.query ? String(req.query.query) : undefined,
      location: req.query.location ? String(req.query.location) : undefined,
      difficulty: req.query.difficulty ? (String(req.query.difficulty) as any) : undefined,

      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      minDuration: req.query.minDuration ? Number(req.query.minDuration) : undefined,
      maxDuration: req.query.maxDuration ? Number(req.query.maxDuration) : undefined,
      maxGroupSize: req.query.maxGroupSize ? Number(req.query.maxGroupSize) : undefined,
      minRatingsAverage: req.query.minRatingsAverage ? Number(req.query.minRatingsAverage) : undefined,

      startDateFrom: req.query.startDateFrom ? String(req.query.startDateFrom) : undefined,
      startDateTo: req.query.startDateTo ? String(req.query.startDateTo) : undefined,

      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,

      sortBy: req.query.sortBy ? (String(req.query.sortBy) as any) : 'createdAt',
      order: req.query.order ? (String(req.query.order) as any) : 'desc',
    };

    const useCase = new SearchToursUseCase(this.tourRepository);
    const result = await useCase.execute(dto);

    res.status(200).json({
      status: 'success',
      results: result.results,
      meta: result.meta,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};
}
