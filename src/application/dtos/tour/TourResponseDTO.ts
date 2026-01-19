export interface TourResponseDTO {
  id: string;
  name: string;
  description: string;
  duration: number;
  maxGroupSize: number;
  difficulty: 'easy' | 'medium' | 'difficult';
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
    address: string;
  };
  locations: Array<{
    description: string;
    coordinates: [number, number];
    day: number;
  }>;
  guides: string[];
  ratingsAverage: number;
  ratingsQuantity: number;
  createdAt: string;
  updatedAt: string;
}
