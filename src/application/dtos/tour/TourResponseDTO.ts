import { Tour } from '@domain/entities/Tour';

export interface TourResponseDTO {
  id: string;
  name: string;
  slug?: string;
  description: string;
  duration: number;
  maxGroupSize: number;
  difficulty: string;
  price: {
    amount: number;
    currency: string;
  };
  summary: string;
  imageCover: string;
  images: string[];
  startDates: string[];
  startLocation: {
    description: string;
    coordinates: [number, number];
    address?: string | null;
  };
  locations: Array<{
    description: string;
    coordinates: [number, number];
    day: number;
  }>;
  guides: string[];
  ratingsAverage: number;
  ratingsQuantity: number;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export class TourResponseDTOMapper {
  static fromEntity(tour: Tour): TourResponseDTO {
    return {
      id: tour.getId() ?? '',
      name: tour.getName(),
      slug: tour.getSlug(),
      description: tour.getDescription(),
      duration: tour.getDuration(),
      maxGroupSize: tour.getMaxGroupSize(),
      difficulty: tour.getDifficulty(),

      price: {
        amount: tour.getPrice().getAmount(),
        currency: tour.getPrice().getCurrency(),
      },

      summary: tour.getSummary(),
      imageCover: tour.getImageCover(),
      images: tour.getImages(),
      startDates: tour.getStartDates().map((date) => date.toISOString()),

      startLocation: tour.getStartLocation(),
      locations: tour.getLocations(),

      guides: tour.getGuides(),

      ratingsAverage: tour.getRatingsAverage(),
      ratingsQuantity: tour.getRatingsQuantity(),
      viewCount: tour.getViewCount(),
      createdAt: tour.getCreatedAt().toISOString(),
      updatedAt: tour.getUpdatedAt().toISOString(),
    };
  }
}
