export interface Business {
  id?: number;
  documentId?: string;

  name: string;
  slug?: string;
  description: string;

  phone: string;
  email: string;
  website?: string;

  logo?: StrapiMedia | null;
  banner?: StrapiMedia | null;

  statusBusiness: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

  address?: string;

  location?: BusinessLocation | null;

  rejectionReason?: string | null;
  approvedAt?: string | null;

  owner?: BusinessOwner | null;
  category?: BusinessCategory | null;

  services?: BusinessServiceRelation[];
}

export interface StrapiMedia {
  id?: number;
  documentId?: string;
  name?: string;
  url?: string;
  alternativeText?: string | null;

  formats?: {
    thumbnail?: StrapiMediaFormat;
    small?: StrapiMediaFormat;
    medium?: StrapiMediaFormat;
    large?: StrapiMediaFormat;
  };
}

export interface StrapiMediaFormat {
  url?: string;
  width?: number;
  height?: number;
}

export interface BusinessLocation {
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface BusinessOwner {
  id?: number;
  documentId?: string;
  username?: string;
  email?: string;
}

export interface BusinessCategory {
  id?: number;
  documentId?: string;
  name?: string;
}

export interface BusinessServiceRelation {
  id?: number;
  documentId?: string;

  name?: string;
  description?: string;

  price?: number;

  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';

  discountValue?: number;

  validFrom?: string | null;
  validUntil?: string | null;

  active?: boolean;

  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
}
