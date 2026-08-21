import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { Router } from '@angular/router';

import { WomanProfileService } from '../../../../core/services/woman-profile.service';

import { DigitalCardService } from '../../../../core/services/digital-card.service';

import { DigitalCard } from '../../../../core/models/digital-card.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;

  // ============================================================
  // INPUTS
  // ============================================================

  @Input() profile: any = null;

  @Input() profileRegistered = false;

  @Input() hasCard = false;

  @Input() card: DigitalCard | null = null;

  // ============================================================
  // OUTPUTS
  // ============================================================

  @Output() profileRegisteredChange = new EventEmitter<any>();

  @Output() profileUpdated = new EventEmitter<any>();

  /**
   * Informa a AccountComponent que se generó una tarjeta.
   */
  @Output() cardGenerated = new EventEmitter<DigitalCard>();

  // ============================================================
  // ESTADO
  // ============================================================

  cardExpired = false;

  submitted = false;

  loading = true;

  saving = false;

  errorMessage = '';

  successMessage = '';

  isEditing = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly womanProfileService: WomanProfileService,
    private readonly digitalCardService: DigitalCardService,
    private readonly router: Router,
  ) {
    this.profileForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],

      lastName: ['', [Validators.required, Validators.minLength(2)]],

      secondLastName: ['', [Validators.required, Validators.minLength(2)]],

      birthDate: ['', Validators.required],
    });
  }

  // ============================================================
  // INICIO
  // ============================================================

  ngOnInit(): void {
    this.loadProfile();
  }

  // ============================================================
  // OBTENER PERFIL DEL USUARIO AUTENTICADO
  // ============================================================

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

  // ============================================================
  // COMPROBAR VENCIMIENTO DE TARJETA
  // ============================================================

  checkExpiration(): void {
    if (!this.card?.expiresAt) {
      this.cardExpired = true;

      return;
    }

    const expiration = new Date(this.card.expiresAt);

    const now = new Date();

    this.cardExpired = expiration.getTime() < now.getTime();
  }

  // ============================================================
  // REGISTRO DEL PERFIL
  // ============================================================

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
        this.loading = false;

        this.saving = false;

        this.successMessage = response.message;

        console.log('Perfil registrado:', response);

        const registeredProfile =
          (response as any)?.data?.woman_profile ??
          (response as any)?.data ??
          response;

        this.profile = registeredProfile;

        this.profileRegistered = true;

        // Informar a AccountComponent
        this.profileRegisteredChange.emit(registeredProfile);
      },

      error: (error) => {
        this.saving = false;

        console.error('Error registrando perfil:', error);

        this.errorMessage =
          error?.error?.message ?? 'No fue posible registrar tu perfil.';
      },
    });
  }

  // ============================================================
  // IR AL DASHBOARD
  // ============================================================

  goToDashboard(): void {
    this.router.navigate(['/woman']);
  }

  // ============================================================
  // GENERAR TARJETA
  // ============================================================

  generateCard(): void {
    // No generar tarjeta si todavía no existe perfil.
    if (!this.profileRegistered) {
      return;
    }

    // Evitar generar otra tarjeta si ya existe.
    if (this.hasCard) {
      return;
    }

    this.loading = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.digitalCardService.generate().subscribe({
      next: (response) => {
        console.log('Tarjeta generada:', response);

        const generatedCard: DigitalCard | null = response?.data ?? null;

        if (!generatedCard) {
          this.errorMessage = 'No fue posible obtener la tarjeta generada.';

          this.loading = false;

          return;
        }

        // ======================================================
        // ACTUALIZAR ESTADO LOCAL
        // ======================================================

        this.card = generatedCard;

        this.hasCard = true;

        this.cardExpired = false;

        // ======================================================
        // AVISAR A ACCOUNT COMPONENT
        // ======================================================

        this.cardGenerated.emit(generatedCard);

        this.successMessage =
          'Tu Tarjeta de la Mujer fue generada correctamente.';

        this.loading = false;
      },

      error: (error) => {
        console.error('Error generando tarjeta:', error);

        this.errorMessage =
          error?.error?.message ?? 'No fue posible generar la tarjeta.';

        this.loading = false;
      },
    });
  }

  // ============================================================
  // VER TARJETA
  // ============================================================

  viewCard(): void {
    this.router.navigate(['/mujer/card']);
  }

  // ============================================================
  // GETTERS FORMULARIO
  // ============================================================

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

  // ============================================================
  // ACTUALIZAR PERFIL
  // ============================================================

  updateProfile(): void {
    this.submitted = true;

    this.errorMessage = '';

    this.successMessage = '';

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();

      return;
    }

    if (!this.profile?.documentId) {
      this.errorMessage = 'No se encontró el identificador del perfil.';

      return;
    }

    const data = {
      firstName: this.profileForm.value.firstName,

      lastName: this.profileForm.value.lastName,

      secondLastName: this.profileForm.value.secondLastName,

      birthDate: this.profileForm.value.birthDate || null,
    };

    this.saving = true;

    this.womanProfileService.update(this.profile.documentId, data).subscribe({
      next: (response) => {
        console.log('Perfil actualizado:', response);

        const updatedProfile = response?.data ?? response;

        this.profile = updatedProfile;

        this.isEditing = false;

        this.saving = false;

        this.successMessage = 'Perfil actualizado correctamente.';

        this.profileUpdated.emit(updatedProfile);
      },

      error: (error) => {
        console.error('Error actualizando perfil:', error);

        this.saving = false;

        this.errorMessage =
          error?.error?.error?.message ??
          error?.error?.message ??
          'No fue posible actualizar tu perfil.';
      },
    });
  }

  // ============================================================
  // EDITAR PERFIL
  // ============================================================

  editProfile(): void {
    if (!this.profile) {
      return;
    }

    this.profileForm.patchValue({
      firstName: this.profile.firstName ?? '',

      lastName: this.profile.lastName ?? '',

      secondLastName: this.profile.secondLastName ?? '',

      birthDate: this.profile.birthDate
        ? this.profile.birthDate.substring(0, 10)
        : '',
    });

    this.isEditing = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.submitted = false;
  }

  // ============================================================
  // CANCELAR EDICIÓN
  // ============================================================

  cancelEdit(): void {
    if (this.profile) {
      this.profileForm.patchValue({
        firstName: this.profile.firstName ?? '',

        lastName: this.profile.lastName ?? '',

        secondLastName: this.profile.secondLastName ?? '',

        birthDate: this.profile.birthDate
          ? this.profile.birthDate.substring(0, 10)
          : '',
      });
    }

    this.isEditing = false;

    this.errorMessage = '';

    this.successMessage = '';

    this.submitted = false;
  }
}
