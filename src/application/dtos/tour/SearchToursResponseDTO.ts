import { Tour } from '@domain/entities/Tour';

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
  data: Tour[];
  meta: SearchMetaDTO;
}
