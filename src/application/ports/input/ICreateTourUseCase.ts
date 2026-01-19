import { CreateTourDTO } from '@application/dtos/tour/CreateTourDTO';
import { TourResponseDTO } from '@application/dtos/tour/TourResponseDTO';

export interface ICreateTourUseCase {
  execute(dto: CreateTourDTO): Promise<TourResponseDTO>;
}
