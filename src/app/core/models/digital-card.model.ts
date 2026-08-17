export interface DigitalCard {
  id: number;
  documentId: string;
  folio: string;
  issuedAt: string;
  expiresAt: string;
  statusCard: string;
  woman_profile: {
    id: number;
    documentId: string;
    firstName: string;
    lastName: string;
    secondLastName: string;
  };
  qrVersion: number;
}

export interface GenerateDigitalCardResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    documentId: string;
    folio: string;
    issuedAt: string;
    expiresAt: string;
    statusCard: string;
    qrVersion: number;

    woman_profile: {
      id: number;
      documentId: string;
      firstName: string;
      lastName: string;
      secondLastName: string;
    };

    qr: {
      version: number;
      token: string;
    };
  };
}

export interface RenewDigitalCardResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    documentId: string;
    folio: string;
    issuedAt: string;
    expiresAt: string;
    statusCard: string;
    qrVersion: number;

    qr: {
      version: number;
      token: string;
    };
  };
}

export interface DigitalCardResponse {
  success: boolean;
  message: string;
  data: DigitalCard;
}
