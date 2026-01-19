import { CreateUserDTO } from '@application/dtos/user/CreateUserDTO';
import { UserResponseDTO } from '@application/dtos/user/UserResponseDTO';

export interface ICreateUserUseCase {
  execute(dto: CreateUserDTO): Promise<UserResponseDTO>;
}
