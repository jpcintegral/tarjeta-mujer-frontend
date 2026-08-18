import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DigitalCard } from '../../../../core/models/digital-card.model';

import { WomanProfileService } from '../../../../core/services/woman-profile.service';
import { DigitalCardService } from '../../../../core/services/digital-card.service';

import { ProfileComponent } from '../profile/profile.component';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, ProfileComponent, CardComponent],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent implements OnInit {
  // ============================================================
  // ESTADO GENERAL
  // ============================================================

  loading = true;

  errorMessage = '';

  successMessage = '';

  // ============================================================
  // PERFIL
  // ============================================================

  hasProfile = false;

  profile: any = null;

  // ============================================================
  // TARJETA
  // ============================================================

  hasCard = false;

  card: DigitalCard | null = null;

  cardExpired = false;

  constructor(
    private readonly womanProfileService: WomanProfileService,
    private readonly digitalCardService: DigitalCardService,
  ) {}

  // ============================================================
  // INICIO
  // ============================================================

  ngOnInit(): void {
    this.loadWomanData();
  }

  // ============================================================
  // CARGAR INFORMACIÓN CONSOLIDADA
  //
  // USER
  //   └── WOMAN_PROFILE
  //          └── DIGITAL_CARD
  // ============================================================

  loadWomanData(): void {
    this.loading = true;

    this.errorMessage = '';

    this.womanProfileService.getMyProfile().subscribe({
      next: (user) => {
        console.log('Información de mujer:', user);

        // ======================================================
        // PERFIL
        // ======================================================

        this.profile = user?.woman_profile ?? null;

        this.hasProfile = !!this.profile;

        // ======================================================
        // NO EXISTE PERFIL
        // ======================================================

        if (!this.hasProfile) {
          this.card = null;

          this.hasCard = false;

          this.cardExpired = false;

          this.loading = false;

          return;
        }

        // ======================================================
        // BUSCAR TARJETA
        // ======================================================

        const digitalCard = this.profile?.digital_card ?? null;

        // ======================================================
        // PERFIL EXISTE PERO NO TIENE TARJETA
        // ======================================================

        if (!digitalCard) {
          this.card = null;

          this.hasCard = false;

          this.cardExpired = false;

          this.loading = false;

          return;
        }

        // ======================================================
        // PERFIL + TARJETA
        // ======================================================

        this.card = this.mapCard(digitalCard);

        this.hasCard = true;

        this.checkExpiration();

        this.loading = false;
      },

      error: (error) => {
        console.error('Error obteniendo información de la mujer:', error);

        this.profile = null;

        this.card = null;

        this.hasProfile = false;

        this.hasCard = false;

        this.cardExpired = false;

        this.errorMessage =
          error?.error?.message ?? 'No fue posible obtener tu información.';

        this.loading = false;
      },
    });
  }

  // ============================================================
  // MAPEAR TARJETA
  // ============================================================

  private mapCard(item: any): DigitalCard {
    return {
      id: item.id,
      documentId: item.documentId,
      folio: item.folio,
      issuedAt: item.issuedAt,
      expiresAt: item.expiresAt,
      statusCard: item.statusCard,
      qrVersion: item.qrVersion,
      woman_profile: item.woman_profile,
    };
  }

  // ============================================================
  // COMPROBAR EXPIRACIÓN
  // ============================================================

  checkExpiration(): void {
    if (!this.card?.expiresAt) {
      this.cardExpired = true;

      return;
    }

    const expiration = new Date(this.card.expiresAt);

    const now = new Date();

    this.cardExpired = expiration.getTime() <= now.getTime();
  }

  // ============================================================
  // GENERAR TARJETA
  // ============================================================

  generateCard(): void {
    // No debe generarse tarjeta sin perfil
    if (!this.hasProfile) {
      return;
    }

    // No generar otra tarjeta si ya existe
    if (this.hasCard) {
      return;
    }

    this.loading = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.digitalCardService.generate().subscribe({
      next: (response) => {
        console.log('Tarjeta generada:', response);

        const generatedCard = response?.data ?? null;

        if (!generatedCard) {
          this.errorMessage = 'No fue posible obtener la tarjeta generada.';

          this.loading = false;

          return;
        }

        this.card = this.mapCard(generatedCard);

        this.hasCard = true;

        this.cardExpired = false;

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
  // PERFIL REGISTRADO
  //
  // ProfileComponent emite:
  //
  // profileRegisteredChange.emit(true)
  //
  // Account vuelve a consultar Strapi para obtener
  // el estado real de USER -> WOMAN_PROFILE -> DIGITAL_CARD
  // ============================================================

  onProfileRegistered(registered: boolean): void {
    this.hasProfile = registered;

    // ==========================================================
    // PERFIL REGISTRADO
    // ==========================================================

    if (registered) {
      this.loadWomanData();

      return;
    }

    // ==========================================================
    // PERFIL NO REGISTRADO
    // ==========================================================

    this.profile = null;

    this.card = null;

    this.hasCard = false;

    this.cardExpired = false;
  }

  // ============================================================
  // TARJETA GENERADA
  //
  // Si CardComponent también emite este evento,
  // Account actualiza su estado.
  // ============================================================

  onCardGenerated(card: DigitalCard): void {
    console.log('Tarjeta generada desde CardComponent:', card);

    this.card = card;

    this.hasCard = true;

    this.cardExpired = false;

    this.errorMessage = '';

    this.successMessage = 'Tu Tarjeta de la Mujer fue generada correctamente.';
  }

  // ============================================================
  // TARJETA RENOVADA
  // ============================================================

  onCardRenewed(card: DigitalCard): void {
    console.log('Tarjeta renovada desde CardComponent:', card);

    this.card = card;

    this.hasCard = true;

    this.cardExpired = false;

    this.errorMessage = '';

    this.successMessage = 'Tu tarjeta fue renovada correctamente.';
  }
  onProfileUpdated(updatedProfile: any): void {
    console.log('Perfil actualizado recibido en Account:', updatedProfile);

    this.profile = updatedProfile;
  }
}
