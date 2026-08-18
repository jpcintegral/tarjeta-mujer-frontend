export interface AuthUser {
  id: number;
  documentId?: string;
  username: string;
  email: string;
  confirmed?: boolean;
  blocked?: boolean;
  role?: {
    id: number;
    name: string;
    type: string;
  };
}
export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  jwt: string;
  user: AuthUser;
}

// ========================================= // REGISTRO // =========================================
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  userType: 'WOMAN';
}
export interface RegisterResponse {
  jwt: string;
  user: AuthUser;
}
