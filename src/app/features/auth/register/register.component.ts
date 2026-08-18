import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  // ============================================================
  // FORMULARIO
  // ============================================================

  registerForm: FormGroup;

  // ============================================================
  // ESTADO
  // ============================================================

  loading = false;

  errorMessage = '';

  successMessage = '';

  submitted = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],

      email: ['', [Validators.required, Validators.email]],

      password: ['', [Validators.required, Validators.minLength(8)]],

      passwordConfirmation: ['', [Validators.required]],
    });
  }

  // ============================================================
  // GETTERS
  // ============================================================

  get username() {
    return this.registerForm.get('username');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get passwordConfirmation() {
    return this.registerForm.get('passwordConfirmation');
  }

  // ============================================================
  // VALIDAR CONFIRMACIÓN DE CONTRASEÑA
  // ============================================================

  get passwordsMatch(): boolean {
    return this.password?.value === this.passwordConfirmation?.value;
  }

  // ============================================================
  // REGISTRAR USUARIA
  // ============================================================

  onSubmit(): void {
    this.submitted = true;

    this.errorMessage = '';

    this.successMessage = '';

    // ==========================================================
    // VALIDACIÓN FORMULARIO
    // ==========================================================

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();

      return;
    }

    // ==========================================================
    // VALIDACIÓN CONTRASEÑAS
    // ==========================================================

    if (!this.passwordsMatch) {
      this.errorMessage = 'Las contraseñas no coinciden.';

      this.passwordConfirmation?.markAsTouched();

      return;
    }

    // ==========================================================
    // LOADING
    // ==========================================================

    this.loading = true;

    // ==========================================================
    // DATOS
    //
    // El backend debe recibir:
    //
    // username
    // email
    // password
    // userType = WOMAN
    //
    // No enviamos:
    //
    // woman_profile
    // digital_card
    // card_token
    // ==========================================================

    const registerData = {
      username: this.username?.value?.trim(),

      email: this.email?.value?.trim(),

      password: this.password?.value,

      userType: 'WOMAN' as const,
    };

    // ==========================================================
    // REGISTRO
    // ==========================================================

    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('Usuaria registrada:', response);

        this.loading = false;

        this.successMessage = 'Tu cuenta fue creada correctamente.';

        // ======================================================
        // STRAPI REGISTRA LA CUENTA Y DEVUELVE JWT
        //
        // Guardamos la sesión mediante AuthService
        // si tu servicio ya lo hace internamente.
        // ======================================================

        setTimeout(() => {
          this.router.navigate(['/mujer/account']);
        }, 800);
      },

      error: (error) => {
        console.error('Error registrando usuaria:', error);

        this.loading = false;

        this.errorMessage =
          error?.error?.message ?? 'No fue posible crear tu cuenta.';
      },
    });
  }

  // ============================================================
  // IR A LOGIN
  // ============================================================

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
