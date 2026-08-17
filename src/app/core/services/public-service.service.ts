import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  PublicService,
  PublicServicesResponse,
} from '../models/public-service.model';

@Injectable({
  providedIn: 'root',
})
export class PublicServiceService {
  private readonly http = inject(HttpClient);
  private readonly strapiUrl = environment.strapiUrl;

  /**
   * URL base del endpoint público de servicios.
   *
   * environment.apiUrl
   *   http://localhost:1337/api
   *
   * resultado:
   *   http://localhost:1337/api/public-services
   */
  private readonly apiUrl = `${environment.apiUrl}/public-services`;

  /**
   * ============================================================
   * OBTENER SERVICIOS
   * ============================================================
   *
   * GET /api/public-services
   *
   * La paginación corresponde a SERVICIOS.
   */
  getServices(
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    category?: string,
    sort?: string,
  ): Observable<PublicServicesResponse> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    if (category?.trim()) {
      params = params.set('category', category.trim());
    }

    if (sort?.trim()) {
      params = params.set('sort', sort.trim());
    }

    return this.http.get<PublicServicesResponse>(this.apiUrl, { params });
  }

  /**
   * ============================================================
   * OBTENER UN SERVICIO
   * ============================================================
   *
   * GET /api/public-services/:documentId
   *
   * Ejemplo:
   *
   * GET
   * http://localhost:1337/api/public-services/
   * ni484yujzfstzciha8inepbo
   */
  getService(documentId: string): Observable<PublicService> {
    return this.http
      .get<{
        success: boolean;
        message: string;
        data: PublicService;
      }>(`${this.apiUrl}/${documentId}`)
      .pipe(map((response) => response.data));
  } /**
   * ============================================================
   * URL DE IMAGEN
   * ============================================================
   *
   * Convierte:
   *
   * /uploads/imagen.jpg
   *
   * en:
   *
   * http://localhost:1337/uploads/imagen.jpg
   */

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
}
