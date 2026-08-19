import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-business-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './business-login.component.html',
  styleUrl: './business-login.component.scss',
})
export class BusinessLoginComponent {
  // ============================================================
  // FORMULARIO
  // ============================================================

  loginForm: FormGroup;

  // ============================================================
  // ESTADO
  // ============================================================

  loading = false;

  errorMessage = '';

  submitted = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.loginForm = this.formBuilder.group({
      identifier: ['', [Validators.required, Validators.minLength(3)]],

      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // ============================================================
  // GETTERS
  // ============================================================

  get identifier() {
    return this.loginForm.get('identifier');
  }

  get password() {
    return this.loginForm.get('password');
  }

  // ============================================================
  // LOGIN
  // ============================================================

  login(): void {
    this.submitted = true;

    this.errorMessage = '';

    // ==========================================================
    // VALIDACIÓN
    // ==========================================================

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();

      return;
    }

    // ==========================================================
    // LOADING
    // ==========================================================

    this.loading = true;

    // ==========================================================
    // CREDENTIALS
    // ==========================================================

    const credentials = {
      identifier: this.identifier?.value?.trim(),

      password: this.password?.value,
    };

    console.log('Business login credentials:', {
      identifier: credentials.identifier,
      password: '********',
    });

    // ==========================================================
    // LOGIN
    // ==========================================================

    this.authService.login(credentials, 'BUSINESS').subscribe({
      next: (response) => {
        console.log('Business login response:', response);

        this.loading = false;

        // ====================================================
        // IR AL ACCOUNT
        // ====================================================

        this.router.navigate(['/business/account']);
      },
      error: (error) => {
        console.error('Business login error:', error);

        this.loading = false;

        this.errorMessage =
          error?.error?.error?.message ??
          error?.error?.message ??
          error?.message ??
          'Correo o contraseña incorrectos.';
      },
    });
  }

  // ============================================================
  // REGISTER
  // ============================================================

  goToRegister(): void {
    this.router.navigate(['/business/register']);
  }

  // ============================================================
  // WOMAN LOGIN
  // ============================================================

  goToWomanLogin(): void {
    this.router.navigate(['/login']);
  }
}
