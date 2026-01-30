import { UserRole } from '@prisma/client';


export interface UserResponseDTO {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}
