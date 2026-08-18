export interface RegisterWomanProfileRequest {
  firstName: string;
  lastName: string;
  secondLastName: string;
  birthDate: string;
}

export interface WomanProfileResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    documentId: string;
    firstName: string;
    lastName: string;
    secondLastName: string;
    birthDate: string | null;
    statusUserw: string;
    user: {
      id: number;
      documentId: string;
      username: string;
      email: string;
    } | null;
  };
}

export interface CurrentUserResponse {
  id: number;
  documentId: string;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;

  woman_profile?: {
    id: number;
    documentId: string;
    firstName: string;
    lastName: string;
    secondLastName: string;
    birthDate: string | null;
    statusUserw: string;
  } | null;
}

export interface UpdateWomanProfileRequest {
  firstName: string;
  lastName: string;
  secondLastName: string;
  birthDate?: string | null;
}
