import { DigitalCardResponse } from '../models/digital-card.model';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DigitalCardService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  /**
   * Obtiene los headers con el JWT del usuario autenticado.
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('tarjeta_mujer_token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  /**
   * Genera la tarjeta digital de la mujer autenticada.
   *
   * POST
   * /api/digital-cards/generate
   */
  generate(): Observable<DigitalCardResponse> {
    return this.http.post<DigitalCardResponse>(
      `${this.apiUrl}/digital-cards/generate`,
      {},
      {
        headers: this.getAuthHeaders(),
      },
    );
  }

  /**
   * Renueva la tarjeta digital.
   *
   * POST
   * /api/digital-card/renew
   */
  renew(): Observable<DigitalCardResponse> {
    return this.http.post<DigitalCardResponse>(
      `${this.apiUrl}/digital-card/renew`,
      {},
      {
        headers: this.getAuthHeaders(),
      },
    );
  }

  /*  getMyCard(documentId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/digital-cards`, {
      params: {
        'filters[woman_profile][documentId][$eq]': documentId,
        populate: '*',
      },
      headers: this.getAuthHeaders(),
    });
  }*/

  regenerateQr(): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/digital-card/qr`,
      {},
      {
        headers: this.getAuthHeaders(),
      },
    );
  }

  /**
   * Obtiene el QR vigente de la tarjeta actual.
   *
   * GET
   * /api/digital-card/qr
   *
   * No genera un QR nuevo.
   * No incrementa qrVersion.
   * No invalida el Card Token actual.
   */
  getCurrentQr(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/digital-card/qr`, {
      headers: this.getAuthHeaders(),
    });
  }
}
