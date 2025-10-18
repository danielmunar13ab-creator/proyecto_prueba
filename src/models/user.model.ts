export type UserRole = 'administrador' | 'cajero' | 'mesero' | 'domiciliario' | 'cocinero';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}