export interface UserResponseDTO {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  createdAt: string;
}
