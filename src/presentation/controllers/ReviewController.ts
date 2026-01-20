import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaReviewRepository } from '@infrastructure/database/repositories/implementations/PrismaReviewRepository';
import { PrismaTourRepository } from '@infrastructure/database/repositories/implementations/PrismaTourRepository';
import { PrismaUserRepository } from '@infrastructure/database/repositories/implementations/PrismaUserRepository';
import { CreateReviewDTO, CreateReviewDTOValidator } from '@application/dtos/review/CreateReviewDTO';
import { ValidationError } from '@shared/errors';
import { Review } from '@domain/entities/Review';
import { Rating } from '@domain/value-objects/Rating';

export class ReviewController {
  private prisma: PrismaClient;
  private reviewRepository: PrismaReviewRepository;
  private tourRepository: PrismaTourRepository;
  private userRepository: PrismaUserRepository;

  constructor() {
    this.prisma = new PrismaClient();
    this.reviewRepository = new PrismaReviewRepository(this.prisma);
    this.tourRepository = new PrismaTourRepository(this.prisma);
    this.userRepository = new PrismaUserRepository(this.prisma);
  }

  createReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreateReviewDTO = {
        tourId: req.body.tourId,
        userId: req.body.userId,
        rating: Number(req.body.rating),
        comment: req.body.comment,
      };

      // Validate DTO at presentation boundary
      const validation = CreateReviewDTOValidator.validate(dto);
      if (!validation.isValid) {
        throw new ValidationError('Review validation failed', validation.errors);
      }

      // Verify tour exists
      const tour = await this.tourRepository.findById(dto.tourId);
      if (!tour) {
        throw new ValidationError('Tour not found', {
          tourId: ['The specified safari tour does not exist'],
        });
      }

      // Verify user exists
      const user = await this.userRepository.findById(dto.userId);
      if (!user) {
        throw new ValidationError('User not found', {
          userId: ['The specified user does not exist'],
        });
      }

      // Check if user already reviewed this tour
      const existingReview = await this.reviewRepository.findByTourAndUser(dto.tourId, dto.userId);
      if (existingReview) {
        throw new ValidationError('Duplicate review', {
          review: ['You have already reviewed this safari tour'],
        });
      }

      // Create domain entity
      const review = new Review({
        id: crypto.randomUUID(),
        tourId: dto.tourId,
        userId: dto.userId,
        rating: new Rating(dto.rating),
        comment: dto.comment,
      });

      // Persist via repository
      const result = await this.reviewRepository.save(review);

      res.status(201).json({
        status: 'success',
        data: {
          id: result.getId(),
          tourId: result.getTourId(),
          userId: result.getUserId(),
          rating: result.getRating().getValue(),
          comment: result.getComment(),
          createdAt: result.getCreatedAt(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const review = await this.reviewRepository.findById(id);

      if (!review) {
        res.status(404).json({
          status: 'error',
          message: 'Safari tour review not found',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: {
          id: review.getId(),
          tourId: review.getTourId(),
          userId: review.getUserId(),
          rating: review.getRating().getValue(),
          comment: review.getComment(),
          createdAt: review.getCreatedAt(),
          updatedAt: review.getUpdatedAt(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  listReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reviews = await this.reviewRepository.findAll();

      const mappedReviews = reviews.map(review => ({
        id: review.getId(),
        tourId: review.getTourId(),
        userId: review.getUserId(),
        rating: review.getRating().getValue(),
        comment: review.getComment(),
        createdAt: review.getCreatedAt(),
      }));

      res.status(200).json({
        status: 'success',
        results: mappedReviews.length,
        data: mappedReviews,
      });
    } catch (error) {
      next(error);
    }
  };

  getReviewsByTour = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tourId = String(req.params.tourId);
      const reviews = await this.reviewRepository.findByTourId(tourId);

      const mappedReviews = reviews.map(review => ({
        id: review.getId(),
        userId: review.getUserId(),
        rating: review.getRating().getValue(),
        comment: review.getComment(),
        createdAt: review.getCreatedAt(),
      }));

      res.status(200).json({
        status: 'success',
        results: mappedReviews.length,
        data: mappedReviews,
      });
    } catch (error) {
      next(error);
    }
  };

  updateReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const review = await this.reviewRepository.findById(id);

      if (!review) {
        res.status(404).json({
          status: 'error',
          message: 'Safari tour review not found',
        });
        return;
      }

      // Update rating if provided
      if (req.body.rating !== undefined) {
        review.updateRating(new Rating(Number(req.body.rating)));
      }

      // Update comment if provided
      if (req.body.comment !== undefined) {
        review.updateComment(req.body.comment);
      }

      const result = await this.reviewRepository.update(review);

      res.status(200).json({
        status: 'success',
        message: 'Review updated successfully',
        data: {
          id: result.getId(),
          rating: result.getRating().getValue(),
          comment: result.getComment(),
          updatedAt: result.getUpdatedAt(),
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
