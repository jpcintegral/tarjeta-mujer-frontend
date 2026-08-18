import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode';

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
  // ============================================================
  // DATOS RECIBIDOS DESDE ACCOUNT
  // ============================================================

  @Input() profile: any = null;

  @Input() card: DigitalCard | null = null;

  @Input() cardExists = false;

  @Input() cardExpired = false;

  // ============================================================
  // EVENTOS HACIA ACCOUNT
  // ============================================================

  @Output() cardRenewed = new EventEmitter<DigitalCard>();

  // ============================================================
  // ESTADO LOCAL
  // ============================================================

  qrToken: string | null = null;

  loading = false;

  generatingQr = false;

  errorMessage = '';

  constructor(
    private readonly digitalCardService: DigitalCardService,
    private readonly router: Router,
  ) {}

  // ============================================================
  // INICIO
  // ============================================================

  ngOnInit(): void {
    if (!this.cardExists || !this.card) {
      return;
    }

    this.getValidQr();
  }

  // ============================================================
  // OBTENER QR VIGENTE
  // ============================================================
  //
  // NO genera una nueva versión.
  //
  // El backend reconstruye el token vigente utilizando:
  //
  // - qrVersion
  // - documentId de la tarjeta
  // - expiresAt
  //
  // Por lo tanto, entrar nuevamente a la tarjeta no cambia
  // innecesariamente la versión del QR.
  // ============================================================

  private getValidQr(): void {
    if (!this.cardExists || !this.card) {
      return;
    }

    this.generatingQr = true;

    this.errorMessage = '';

    this.digitalCardService.getCurrentQr().subscribe({
      next: (response: any) => {
        console.log('QR vigente:', response);

        this.qrToken = response?.data?.token ?? null;

        if (!this.qrToken) {
          this.errorMessage = 'No fue posible obtener el código QR vigente.';
        }

        this.generatingQr = false;
      },

      error: (error: any) => {
        console.error('Error obteniendo QR vigente:', error);

        this.qrToken = null;

        this.errorMessage =
          error?.error?.message ?? 'No fue posible obtener el código QR.';

        this.generatingQr = false;
      },
    });
  }

  // ============================================================
  // RENOVAR TARJETA
  // ============================================================

  renewCard(): void {
    if (!this.cardExists) {
      return;
    }

    this.loading = true;

    this.errorMessage = '';

    this.digitalCardService.renew().subscribe({
      next: (response: any) => {
        console.log('Tarjeta renovada:', response);

        const renewedCard: DigitalCard | null = response?.data ?? null;

        if (!renewedCard) {
          this.errorMessage = 'No fue posible obtener la tarjeta renovada.';

          this.loading = false;

          return;
        }

        // Actualizar tarjeta local
        this.card = renewedCard;

        this.cardExists = true;

        this.cardExpired = false;

        // El QR anterior deja de utilizarse visualmente.
        this.qrToken = null;

        this.loading = false;

        // Informar a AccountComponent
        this.cardRenewed.emit(renewedCard);

        // Obtener el nuevo QR correspondiente a la tarjeta renovada.
        this.getValidQr();
      },

      error: (error: any) => {
        console.error('Error renovando tarjeta:', error);

        this.errorMessage =
          error?.error?.error?.message ??
          error?.error?.message ??
          'No fue posible renovar la tarjeta.';
        this.loading = false;
      },
    });
  }

  // ============================================================
  // VOLVER AL PERFIL
  // ============================================================

  goToProfile(): void {
    this.router.navigate(['/woman']);
  }
}
