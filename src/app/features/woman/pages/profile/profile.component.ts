import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { WomanProfileService } from '../../../../core/services/woman-profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;

  profileRegistered = false;

  profile: any = null;

  card: any = null;

  hasCard = false;

  cardExpired = false;

  submitted = false;

  loading = true;

  saving = false;

  errorMessage = '';

  successMessage = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly womanProfileService: WomanProfileService,
    private readonly router: Router,
  ) {
    this.profileForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],

      lastName: ['', [Validators.required, Validators.minLength(2)]],

      secondLastName: ['', [Validators.required, Validators.minLength(2)]],

      birthDate: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  /**
   * ============================================================
   * OBTENER PERFIL DEL USUARIO AUTENTICADO
   * ============================================================
   *
   * La respuesta ya contiene:
   *
   * user
   *   └── woman_profile
   *          └── digital_card
   *
   * No realizamos una consulta adicional para obtener la tarjeta.
   */
  loadProfile(): void {
    this.loading = true;

    this.errorMessage = '';

    this.womanProfileService.getMyProfile().subscribe({
      next: (user) => {
        this.profile = user?.woman_profile ?? null;

        this.profileRegistered = !!this.profile;

        // ======================================================
        // NO TIENE PERFIL
        // ======================================================

        if (!this.profileRegistered) {
          this.card = null;
          this.hasCard = false;
          this.cardExpired = false;

          this.loading = false;

          return;
        }

        // ======================================================
        // TIENE PERFIL
        // ======================================================

        this.card = this.profile?.digital_card ?? null;

        this.hasCard = !!this.card;

        // ======================================================
        // TIENE TARJETA
        // ======================================================

        if (this.hasCard) {
          this.checkExpiration();
        } else {
          this.cardExpired = false;
        }

        this.loading = false;
      },

      error: (error) => {
        console.error('Error obteniendo perfil:', error);

        this.profile = null;
        this.card = null;

        this.profileRegistered = false;
        this.hasCard = false;

        this.errorMessage =
          error?.error?.message ?? 'No fue posible obtener tu información.';

        this.loading = false;
      },
    });
  }

  /**
   * ============================================================
   * COMPROBAR VENCIMIENTO DE TARJETA
   * ============================================================
   */
  checkExpiration(): void {
    if (!this.card?.expiresAt) {
      this.cardExpired = true;

      return;
    }

    const expiration = new Date(this.card.expiresAt);

    const now = new Date();

    this.cardExpired = expiration.getTime() < now.getTime();
  }

  /**
   * ============================================================
   * REGISTRO DEL PERFIL
   * ============================================================
   */
  onSubmit(): void {
    this.submitted = true;

    this.errorMessage = '';

    this.successMessage = '';

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();

      return;
    }

    const token = localStorage.getItem('tarjeta_mujer_token');

    if (!token) {
      this.errorMessage = 'Tu sesión no es válida. Inicia sesión nuevamente.';

      return;
    }

    this.saving = true;

    this.womanProfileService.register(this.profileForm.value).subscribe({
      next: (response) => {
        this.saving = false;

        this.successMessage =
          response?.message ?? 'Perfil registrado correctamente.';

        console.log('Perfil registrado:', response);

        /*
         * Regresamos al dashboard para que se ejecute nuevamente
         * el flujo consolidado:
         *
         * perfil → tarjeta → generar tarjeta
         */
        setTimeout(() => {
          this.router.navigate(['/woman']);
        }, 1000);
      },

      error: (error) => {
        this.saving = false;

        console.error('Error registrando perfil:', error);

        this.errorMessage =
          error?.error?.message ?? 'No fue posible registrar tu perfil.';
      },
    });
  }

  /**
   * ============================================================
   * IR AL DASHBOARD
   * ============================================================
   *
   * Se utiliza cuando la mujer ya tiene perfil pero todavía
   * no tiene tarjeta.
   */
  goToDashboard(): void {
    this.router.navigate(['/woman']);
  }

  /**
   * ============================================================
   * VER TARJETA
   * ============================================================
   */
  viewCard(): void {
    this.router.navigate(['/mujer/card']);
  }

  get firstName() {
    return this.profileForm.get('firstName');
  }

  get lastName() {
    return this.profileForm.get('lastName');
  }

  get secondLastName() {
    return this.profileForm.get('secondLastName');
  }

  get birthDate() {
    return this.profileForm.get('birthDate');
  }
}
