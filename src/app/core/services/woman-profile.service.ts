import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  RegisterWomanProfileRequest,
  WomanProfileResponse,
  CurrentUserResponse,
} from '../models/woman-profile.model';

@Injectable({
  providedIn: 'root',
})
export class WomanProfileService {
  private readonly apiUrl = `${environment.apiUrl}`;

  constructor(private readonly http: HttpClient) {}

  register(
    data: RegisterWomanProfileRequest,
  ): Observable<WomanProfileResponse> {
    const token = localStorage.getItem('tarjeta_mujer_token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post<WomanProfileResponse>(
      `${this.apiUrl}/woman-profiles/register`,
      {
        data,
      },
      {
        headers,
      },
    );
  }

  getCurrentUser(): Observable<CurrentUserResponse> {
    const token = localStorage.getItem('tarjeta_mujer_token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<CurrentUserResponse>(`${this.apiUrl}/users/me`, {
      headers,
    });
  }

  getMyProfile(): Observable<any> {
    const token = localStorage.getItem('tarjeta_mujer_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<any>(
      `${this.apiUrl}/users/me?populate[woman_profile][populate][digital_card]=true`,
      {
        headers,
      },
    );
  }
}
