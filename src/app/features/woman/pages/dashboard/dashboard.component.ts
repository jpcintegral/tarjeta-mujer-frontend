import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WomanProfileService } from '../../../../core/services/woman-profile.service';
import { DigitalCardService } from '../../../../core/services/digital-card.service';

import { DigitalCard } from '../../../../core/models/digital-card.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  user = this.getUser();
  loading = true;
  hasProfile = false;
  hasCard = false;

  cardExpired = false;
  profile: any = null;
  card: DigitalCard | null = null;
  errorMessage = '';

  constructor(
    private readonly womanProfileService: WomanProfileService,
    private readonly digitalCardService: DigitalCardService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadWomanData();
  }

  /**
   * Cargar información de la mujer
   */
  loadWomanData(): void {
    this.loading = true;
    this.errorMessage = '';

    this.womanProfileService.getMyProfile().subscribe({
      next: (user) => {
        this.profile = user?.woman_profile ?? null;

        this.hasProfile = !!this.profile;

        // ============================================
        // NO TIENE PERFIL
        // ============================================

        if (!this.hasProfile) {
          this.hasCard = false;
          this.card = null;
          this.loading = false;
          return;
        }

        // ============================================
        // TIENE PERFIL
        // ============================================

        const digitalCard = this.profile?.digital_card ?? null;

        // ============================================
        // TIENE TARJETA
        // ============================================

        if (digitalCard) {
          this.card = this.mapCard(digitalCard);
          this.hasCard = true;
          this.checkExpiration();
        }

        // ============================================
        // TIENE PERFIL PERO NO TARJETA
        // ============================================
        else {
          this.card = null;
          this.hasCard = false;
          this.cardExpired = false;
        }

        this.loading = false;
      },

      error: (error) => {
        console.error('Error obteniendo perfil:', error);

        this.profile = null;
        this.card = null;
        this.hasProfile = false;
        this.hasCard = false;

        this.errorMessage =
          error?.error?.message ?? 'No fue posible obtener tu información.';

        this.loading = false;
      },
    });
  }

  getUser(): any {
    const user = localStorage.getItem('tarjeta_mujer_user');

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  }

  /**
   * Adaptar respuesta de Strapi
   */
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

  /**
   * Comprobar vencimiento
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
   * Ir al registro de perfil
   */
  registerProfile(): void {
    this.router.navigate(['/woman/profile']);
  }

  /**
   * Generar tarjeta
   */
  generateCard(): void {
    this.loading = true;

    this.digitalCardService.generate().subscribe({
      next: (response) => {
        this.card = response.data;

        this.hasCard = true;

        this.cardExpired = false;

        this.loading = false;

        console.log('Tarjeta generada:', response);
      },

      error: (error) => {
        console.error('Error generando tarjeta:', error);

        this.errorMessage =
          error?.error?.message ?? 'No fue posible generar la tarjeta.';

        this.loading = false;
      },
    });
  }

  /**
   * Renovar tarjeta
   */
  renewCard(): void {
    this.loading = true;

    this.digitalCardService.renew().subscribe({
      next: (response) => {
        this.card = response.data;

        this.hasCard = true;

        this.cardExpired = false;

        this.loading = false;
      },

      error: (error) => {
        console.error('Error renovando tarjeta:', error);

        this.errorMessage =
          error?.error?.message ?? 'No fue posible renovar la tarjeta.';

        this.loading = false;
      },
    });
  }

  /**
   * Ver tarjeta completa
   */
  viewCard(): void {
    this.router.navigate(['/mujer/card'], {
      state: {
        card: this.card,
      },
    });
  }
}
