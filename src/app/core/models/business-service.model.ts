export interface BusinessService {
  id?: number;
  documentId?: string;

  name: string;
  description: string;

  image?: any;

  price: number;

  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';

  discountValue: number;

  validFrom?: string | null;

  validUntil?: string | null;

  active: boolean;

  business?: any;

  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface BusinessServiceBusiness {
  id?: number;
  documentId?: string;
  name?: string;
}
