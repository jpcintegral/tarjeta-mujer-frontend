import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,

  imports: [CommonModule, ReactiveFormsModule, RouterLink],

  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  loginForm: FormGroup = this.formBuilder.group({
    identifier: ['', [Validators.required, Validators.minLength(3)]],

    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loading = false;

  errorMessage = '';

  // =========================================
  // FORM CONTROLS
  // =========================================

  get identifier() {
    return this.loginForm.get('identifier');
  }

  get password() {
    return this.loginForm.get('password');
  }

  // =========================================
  // LOGIN
  // =========================================

  onSubmit(): void {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();

      return;
    }

    this.loading = true;

    const credentials = {
      identifier: this.loginForm.get('identifier')?.value,
      password: this.loginForm.get('password')?.value,
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('LOGIN RESPONSE:', response);

        console.log('TOKEN:', response.jwt);

        console.log('USER:', response.user);

        console.log('ROLE:', response.user.role);

        this.loading = false;

        this.router.navigate(['/mujer/account']);
      },

      error: (error) => {
        console.error('Error de login:', error);

        this.loading = false;

        this.errorMessage =
          error?.error?.message ||
          'No fue posible iniciar sesión. Verifica tu correo y contraseña.';
      },
    });
  }

  // =========================================
  // REGISTRO
  // =========================================

  goToRegister(): void {
    this.router.navigate(['/registro']);
  }
}
