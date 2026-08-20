import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Business } from '../models/business.model';

@Injectable({
  providedIn: 'root',
})
export class BusinessService {
  private readonly apiUrl = environment.apiUrl;
  private readonly strapiUrl = environment.strapiUrl;
  constructor(private readonly http: HttpClient) {}

  /**
   * Obtiene el usuario autenticado junto con sus negocios.
   */
  getMyBusiness(): Observable<Business | null> {
    const token = localStorage.getItem('tarjeta_business_token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .get<any>(
        `${this.apiUrl}/users/me?populate[businesses][populate][0]=logo&populate[businesses][populate][1]=banner&populate[businesses][populate][2]=category&populate[businesses][populate][3]=services`,
        {
          headers,
        },
      )
      .pipe(
        map((response) => {
          console.log('Usuario autenticado:', response);

          const businesses = response?.businesses ?? [];

          if (!businesses.length) {
            return null;
          }

          return businesses[0] as Business;
        }),
      );
  }

  /**
   * Obtiene un Business utilizando su documentId.
   */
  getByDocumentId(documentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/businesses/${documentId}?populate=*`);
  }

  /**
   * Actualiza un Business existente.
   */
  update(
    documentId: number | string,
    data: Partial<Business>,
    logoFile?: File | null,
    bannerFile?: File | null,
  ): Observable<any> {
    const token = localStorage.getItem('tarjeta_mujer_token');

    const formData = new FormData();

    formData.append('data', JSON.stringify(data));

    if (logoFile) {
      formData.append('logo', logoFile);
    }

    if (bannerFile) {
      formData.append('banner', bannerFile);
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.put(`${this.apiUrl}/businesses/${documentId}`, formData, {
      headers,
    });
  }

  /**
   * Obtiene los negocios públicos.
   */
  getPublicBusinesses(): Observable<any> {
    return this.http.get(`${this.apiUrl}/public-businesses`);
  }

  // ============================================================
  // REGISTRAR NEGOCIO
  // ============================================================

  register(
    data: Partial<Business>,
    logoFile?: File | null,
    bannerFile?: File | null,
  ): Observable<any> {
    const token = localStorage.getItem('tarjeta_mujer_token');

    const formData = new FormData();

    formData.append('data', JSON.stringify(data));

    if (logoFile) {
      formData.append('logo', logoFile);
    }

    if (bannerFile) {
      formData.append('banner', bannerFile);
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(`${this.apiUrl}/businesses/register`, formData, {
      headers,
    });
  }

  getImageUrl(
    image: any | null | undefined,
    size: 'large' | 'medium' | 'small' | 'thumbnail' | 'original' = 'medium',
  ): string | null {
    if (!image) {
      return null;
    }

    let url: string | undefined;

    if (size !== 'original' && image.formats) {
      url = image.formats[size]?.url;
    }

    if (!url) {
      url = image.url;
    }

    if (!url) {
      return null;
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    return `${this.strapiUrl}${url}`;
  }

  validateCard(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/card-tokens/scan`, {
      token,
    });
  }

  registerVisit(token: string, device?: string | null): Observable<any> {
    return this.http.post(`${this.apiUrl}/business-visits/register`, {
      token,
      device: device ?? null,
    });
  }

  applyDiscount(visitId: string, serviceId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/discount-usages/apply`, {
      visitId,
      serviceId,
    });
  }
}
