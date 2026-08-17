export interface PublicService {
  id: number;
  documentId: string;

  name: string;
  description: string | null;

  image: string | null;

  price: number;

  discountType: 'PERCENTAGE' | 'FIXED';

  discountValue: number;
  discountAmount: number;
  finalPrice: number;

  validFrom: string;
  validUntil: string;

  active: boolean;

  business: {
    id: number;
    documentId: string;

    name: string;
    slug: string | null;

    description: string | null;

    phone: string | null;
    email: string | null;
    website: string | null;

    address: string | null;

    logo: string | null;
    banner: string | null;

    category: unknown;
    location: unknown;
  };
}

/**
 * Respuesta del endpoint:
 *
 * GET /api/public-services
 */
export interface PublicServicesResponse {
  success: boolean;

  message: string;

  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };

  filters: {
    search: string | null;
    category: string | null;
    sort: string;
  };

  data: PublicService[];
}

/**
 * Respuesta del endpoint:
 *
 * GET /api/public-services/:documentId
 */
export interface PublicServiceResponse {
  success: boolean;

  message: string;

  data: PublicService;
}
