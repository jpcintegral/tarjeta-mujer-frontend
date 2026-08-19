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

  constructor(private readonly http: HttpClient) {}

  /**
   * Obtiene el usuario autenticado junto con sus negocios.
   */
  getMyBusiness(): Observable<Business | null> {
    const token = localStorage.getItem('tarjeta_mujer_token');

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
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/businesses/${documentId}`, {
      data,
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

  register(data: Partial<Business>): Observable<any> {
    const token = localStorage.getItem('tarjeta_mujer_token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(`${this.apiUrl}/businesses/register`, data, {
      headers,
    });
  }
}
