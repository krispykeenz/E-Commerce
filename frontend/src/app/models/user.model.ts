export interface User {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role?: 'user' | 'admin';
  addresses?: Address[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Address {
  _id?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
