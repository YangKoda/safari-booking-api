import { TourResponseDTO } from './TourResponseDTO';

export interface SearchMetaDTO {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SearchToursResponseDTO {
  results: number;
  data: TourResponseDTO[];
  meta: SearchMetaDTO;
}
