export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  organizationId: string;
}

export interface Organization {
  id: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;

  data: {
    access_token: string;
    user: User;
    organization?: Organization;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  organizationName: string;
  name: string;
  email: string;
  password: string;
}