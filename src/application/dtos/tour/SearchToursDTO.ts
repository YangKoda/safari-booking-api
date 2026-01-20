export type TourSortBy = 'createdAt' | 'priceAmount' | 'ratingsAverage' | 'duration';
export type SortOrder = 'asc' | 'desc';

export interface SearchToursDTO {
  // Filters
  query?: string; // search by name/summary/description
  difficulty?: 'easy' | 'medium' | 'difficult';
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  maxGroupSize?: number;
  minRatingsAverage?: number;
  startDateFrom?: string; // ISO date
  startDateTo?: string;   // ISO date
  location?: string;      // matches TourLocation.description

  // Pagination
  page?: number; // default 1
  limit?: number; // default 10

  // Sorting
  sortBy?: TourSortBy; // default createdAt
  order?: SortOrder;   // default desc
}
