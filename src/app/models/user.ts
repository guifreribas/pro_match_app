export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'REFEREE';

export interface User {
  id: number;
  name: string;
  last_name: string;
  email: string;
  password?: string;
  birthday: Date;
  avatar: string;
  role: UserRole;
  created_at?: Date;
  updated_at?: Date;
}
