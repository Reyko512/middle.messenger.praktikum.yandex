import type { User } from '@entities/user';

export interface SignInRequest {
  login: string;
  password: string;
}

export interface SignUpRequest {
  first_name: string;
  second_name: string;
  login: string;
  email: string;
  password: string;
  phone: string;
}

export interface Session {
  user: User | null;
  isAuthenticated: boolean;
}
