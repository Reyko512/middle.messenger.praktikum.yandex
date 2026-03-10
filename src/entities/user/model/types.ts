export interface User {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string | null;
  login: string;
  email: string;
  phone: string;
  avatar: string | null;
  role?: 'admin' | 'regular';
}

export interface UpdateProfileRequest {
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
}

export interface UpdatePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface SearchUserRequest {
  login: string;
}
