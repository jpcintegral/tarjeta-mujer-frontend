import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode';

import { WomanProfileService } from '../../../../core/services/woman-profile.service';
import { DigitalCardService } from '../../../../core/services/digital-card.service';

import { DigitalCard } from '../../../../core/models/digital-card.model';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, QRCodeComponent],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent implements OnInit {
  cardExists = false;

  card: DigitalCard | null = null;

  profile: any = null;

  qrToken: string | null = null;

  loading = true;

  generatingQr = false;

  errorMessage = '';

  constructor(
    private readonly womanProfileService: WomanProfileService,
    private readonly digitalCardService: DigitalCardService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadCard();
  }

  /**
   * ============================================================
   * CARGAR PERFIL Y TARJETA
   * ============================================================
   *
   * Obtiene directamente de Strapi:
   *
   * user
   *   └── woman_profile
   *          └── digital_card
   */
  private loadCard(): void {
    this.loading = true;
    this.errorMessage = '';

    this.womanProfileService.getMyProfile().subscribe({
      next: (user) => {
        this.profile = user?.woman_profile ?? null;

        // ============================================
        // NO EXISTE PERFIL
        // ============================================

        if (!this.profile) {
          this.cardExists = false;
          this.card = null;
          this.loading = false;

          return;
        }

        // ============================================
        // OBTENER TARJETA
        // ============================================

        const digitalCard = this.profile?.digital_card ?? null;

        // ============================================
        // NO EXISTE TARJETA
        // ============================================

        if (!digitalCard) {
          this.cardExists = false;
          this.card = null;
          this.loading = false;

          return;
        }

        // ============================================
        // EXISTE TARJETA
        // ============================================

        this.card = this.mapCard(digitalCard);

        this.cardExists = true;

        this.loading = false;

        // ============================================
        // OBTENER QR REAL
        // ============================================

        this.generateQr();
      },

      error: (error) => {
        console.error('Error obteniendo perfil y tarjeta:', error);

        this.profile = null;
        this.card = null;
        this.cardExists = false;

        this.errorMessage =
          error?.error?.message ??
          'No fue posible obtener la información de tu tarjeta.';

        this.loading = false;
      },
    });
  }

  /**
   * ============================================================
   * ADAPTAR TARJETA
   * ============================================================
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
   * ============================================================
   * GENERAR / OBTENER QR REAL
   * ============================================================
   */
  generateQr(): void {
    if (!this.cardExists || !this.card) {
      return;
    }

    this.generatingQr = true;

    this.errorMessage = '';

    this.digitalCardService.getCurrentQr().subscribe({
      next: (response) => {
        console.log('Respuesta regeneración QR:', response);

        /*
         * El backend puede devolver:
         *
         * data.token
         *
         * o
         *
         * data.qr.token
         */

        this.qrToken =
          response?.data?.qr?.token ?? response?.data?.token ?? null;

        if (!this.qrToken) {
          this.errorMessage = 'No fue posible obtener el código QR.';
        }

        this.generatingQr = false;
      },

      error: (error) => {
        console.error('Error obteniendo QR:', error);

        this.qrToken = null;

        this.errorMessage =
          error?.error?.message ?? 'No fue posible generar el código QR.';

        this.generatingQr = false;
      },
    });
  }

  /**
   * ============================================================
   * RENOVAR TARJETA
   * ============================================================
   */
  renewCard(): void {
    if (!this.cardExists) {
      return;
    }

    this.loading = true;

    this.errorMessage = '';

    this.digitalCardService.renew().subscribe({
      next: (response) => {
        this.card = response.data;

        this.cardExists = true;

        this.loading = false;

        /*
         * Después de renovar obtenemos nuevamente
         * el QR correspondiente a la nueva tarjeta.
         */
        this.generateQr();
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
   * ============================================================
   * VOLVER AL PERFIL
   * ============================================================
   */
  goToProfile(): void {
    this.router.navigate(['/mujer']);
  }
}
