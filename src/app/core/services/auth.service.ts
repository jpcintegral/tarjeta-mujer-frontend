import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, map, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  LoginRequest,
  LoginResponse,
  AuthUser,
  RegisterRequest,
  RegisterResponse,
} from '../models/auth.model';

export type AuthContext =
  | 'WOMAN'
  | 'BUSINESS'
  | 'BUSINESS_EMPLOYEE'
  | 'CITY_HALL'
  | 'ADMIN';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // ============================================================
  // SESSION STORAGE KEYS
  // ============================================================

  private readonly WOMAN_TOKEN_KEY = 'tarjeta_mujer_token';
  private readonly WOMAN_USER_KEY = 'tarjeta_mujer_user';

  private readonly BUSINESS_TOKEN_KEY = 'tarjeta_business_token';
  private readonly BUSINESS_USER_KEY = 'tarjeta_business_user';

  private readonly BUSINESS_EMPLOYEE_TOKEN_KEY =
    'tarjeta_business_employee_token';

  private readonly BUSINESS_EMPLOYEE_USER_KEY =
    'tarjeta_business_employee_user';

  private readonly CITY_HALL_TOKEN_KEY = 'tarjeta_cityhall_token';
  private readonly CITY_HALL_USER_KEY = 'tarjeta_cityhall_user';

  private readonly ADMIN_TOKEN_KEY = 'tarjeta_admin_token';
  private readonly ADMIN_USER_KEY = 'tarjeta_admin_user';

  // ============================================================
  // LOGIN
  // ============================================================

  login(
    credentials: LoginRequest,
    context: AuthContext,
  ): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/local`, credentials)
      .pipe(
        switchMap((response) => {
          /**
           * /auth/local actualmente devuelve:
           *
           * {
           *   jwt,
           *   user
           * }
           *
           * pero NO devuelve role.
           *
           * Por eso consultamos /users/me utilizando
           * temporalmente el JWT recibido.
           */

          return this.getAuthenticatedUser(response.jwt).pipe(
            map((user) => ({
              ...response,
              user,
            })),
          );
        }),

        switchMap((response) => {
          /**
           * Validamos el rol ANTES de guardar
           * cualquier sesión.
           */
          console.log('LOGIN RESPONSE:', response);
          if (!this.isValidContext(response.user, context)) {
            return throwError(
              () => new Error(this.getInvalidContextMessage(context)),
            );
          }

          /**
           * El JWT solamente se guarda después
           * de comprobar que el usuario pertenece
           * al flujo correcto.
           */

          this.saveSession(context, response.jwt, response.user);

          return [response];
        }),
      );
  }

  // ============================================================
  // OBTENER USUARIO AUTENTICADO
  // ============================================================

  private getAuthenticatedUser(token: string): Observable<AuthUser> {
    return this.http.get<AuthUser>(
      `${environment.apiUrl}/users/me?populate=role`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  }

  // ============================================================
  // VALIDAR CONTEXTO / ROLE
  // ============================================================

  private isValidContext(user: AuthUser, context: AuthContext): boolean {
    const roleType = user?.role?.type;

    console.log('AUTH CONTEXT:', context);
    console.log('AUTH USER:', user);
    console.log('AUTH ROLE:', user?.role);
    console.log('AUTH ROLE TYPE:', roleType);

    switch (context) {
      case 'WOMAN':
        return roleType === 'woman';

      case 'BUSINESS':
        return roleType === 'business-owner';

      case 'BUSINESS_EMPLOYEE':
        return roleType === 'business-employee';

      case 'CITY_HALL':
        return roleType === 'city-hall';

      case 'ADMIN':
        return roleType === 'admin';

      default:
        return false;
    }
  }

  // ============================================================
  // MENSAJE DE CONTEXTO INVÁLIDO
  // ============================================================

  private getInvalidContextMessage(context: AuthContext): string {
    switch (context) {
      case 'WOMAN':
        return 'Esta cuenta no pertenece al flujo de mujeres.';

      case 'BUSINESS':
        return 'Esta cuenta no pertenece al flujo de negocio.';

      case 'BUSINESS_EMPLOYEE':
        return 'Esta cuenta no pertenece al flujo de empleados de negocio.';

      case 'CITY_HALL':
        return 'Esta cuenta no pertenece al flujo de Ayuntamiento.';

      case 'ADMIN':
        return 'Esta cuenta no pertenece al flujo de administración.';

      default:
        return 'Esta cuenta no pertenece al flujo seleccionado.';
    }
  }

  // ============================================================
  // GUARDAR SESIÓN
  // ============================================================

  private saveSession(
    context: AuthContext,
    token: string,
    user: AuthUser,
  ): void {
    const keys = this.getStorageKeys(context);

    localStorage.setItem(keys.token, token);
    localStorage.setItem(keys.user, JSON.stringify(user));
  }

  // ============================================================
  // OBTENER STORAGE KEYS
  // ============================================================

  private getStorageKeys(context: AuthContext): {
    token: string;
    user: string;
  } {
    switch (context) {
      case 'WOMAN':
        return {
          token: this.WOMAN_TOKEN_KEY,
          user: this.WOMAN_USER_KEY,
        };

      case 'BUSINESS':
        return {
          token: this.BUSINESS_TOKEN_KEY,
          user: this.BUSINESS_USER_KEY,
        };

      case 'BUSINESS_EMPLOYEE':
        return {
          token: this.BUSINESS_EMPLOYEE_TOKEN_KEY,
          user: this.BUSINESS_EMPLOYEE_USER_KEY,
        };

      case 'CITY_HALL':
        return {
          token: this.CITY_HALL_TOKEN_KEY,
          user: this.CITY_HALL_USER_KEY,
        };

      case 'ADMIN':
        return {
          token: this.ADMIN_TOKEN_KEY,
          user: this.ADMIN_USER_KEY,
        };
    }
  }

  // ============================================================
  // TOKEN DEL CONTEXTO
  // ============================================================

  getToken(context: AuthContext = 'WOMAN'): string | null {
    const keys = this.getStorageKeys(context);

    return localStorage.getItem(keys.token);
  }

  // ============================================================
  // USUARIO DEL CONTEXTO
  // ============================================================

  getCurrentUser(context: AuthContext = 'WOMAN'): AuthUser | null {
    const keys = this.getStorageKeys(context);

    const user = localStorage.getItem(keys.user);

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user) as AuthUser;
    } catch {
      return null;
    }
  }

  // ============================================================
  // SESIÓN AUTENTICADA
  // ============================================================

  isAuthenticated(context: AuthContext = 'WOMAN'): boolean {
    return !!this.getToken(context);
  }

  // ============================================================
  // LOGOUT
  // ============================================================

  logout(context: AuthContext = 'WOMAN'): void {
    const keys = this.getStorageKeys(context);

    localStorage.removeItem(keys.token);
    localStorage.removeItem(keys.user);
  }

  // ============================================================
  // ROLE
  // ============================================================

  getUserRole(context: AuthContext = 'WOMAN'): string | null {
    const user = this.getCurrentUser(context);

    return user?.role?.type ?? null;
  }

  // ============================================================
  // REGISTRO
  // ============================================================

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http
      .post<RegisterResponse>(`${this.apiUrl}/local/register`, data)
      .pipe(
        tap((response) => {
          /**
           * Actualmente el registro solamente soporta WOMAN.
           *
           * Posteriormente podremos manejar BUSINESS,
           * CITY_HALL, etc. con el mismo sistema.
           */
          this.saveSession('WOMAN', response.jwt, response.user);
        }),
      );
  }
}
