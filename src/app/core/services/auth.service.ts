import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  LoginRequest,
  LoginResponse,
  AuthUser,
  RegisterRequest,
  RegisterResponse,
} from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly tokenKey = 'tarjeta_mujer_token';

  private readonly userKey = 'tarjeta_mujer_user';

  // =========================================
  // LOGIN
  // =========================================

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/local`, credentials)
      .pipe(
        tap((response) => {
          this.saveSession(response.jwt, response.user);
        }),
      );
  }

  // =========================================
  // GUARDAR SESIÓN
  // =========================================

  private saveSession(token: string, user: AuthUser): void {
    localStorage.setItem(this.tokenKey, token);

    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // =========================================
  // TOKEN
  // =========================================

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // =========================================
  // USUARIO
  // =========================================

  getCurrentUser(): AuthUser | null {
    const user = localStorage.getItem(this.userKey);

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user) as AuthUser;
    } catch {
      return null;
    }
  }

  // =========================================
  // AUTENTICADO
  // =========================================

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // =========================================
  // LOGOUT
  // =========================================

  logout(): void {
    localStorage.removeItem(this.tokenKey);

    localStorage.removeItem(this.userKey);
  }

  // =========================================
  // ROLE
  // =========================================

  getUserRole(): string | null {
    const user = this.getCurrentUser();

    return user?.role?.type ?? null;
  }

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http
      .post<RegisterResponse>(`${this.apiUrl}/local/register`, data)
      .pipe(
        tap((response) => {
          this.saveSession(response.jwt, response.user);
        }),
      );
  }
}
