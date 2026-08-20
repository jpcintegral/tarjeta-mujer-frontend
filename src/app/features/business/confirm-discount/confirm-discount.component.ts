import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { BusinessService } from '../../../core/services/business.service';
import { BusinessService as BusinessServiceModel } from '../../../core/models/business-service.model';

@Component({
  selector: 'app-confirm-discount',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-discount.component.html',
  styleUrl: './confirm-discount.component.scss',
})
export class ConfirmDiscountComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly businessService = inject(BusinessService);
  showSuccessModal = false;
  discountResult: any = null;
  validation: any = null;
  service: BusinessServiceModel | null = null;
  token = '';

  loading = false;
  error = '';

  ngOnInit(): void {
    const state = history.state;

    this.validation = state?.validation;
    this.service = state?.service;
    this.token = state?.token ?? '';
    if (!this.validation || !this.service || !this.token) {
      this.router.navigate(['/business/scan-card']);
      return;
    }
  }

  get originalAmount(): number {
    return Number(this.service?.price ?? 0);
  }

  get discountAmount(): number {
    if (!this.service) {
      return 0;
    }

    const price = Number(this.service.price);
    const value = Number(this.service.discountValue);

    if (this.service.discountType === 'PERCENTAGE') {
      return price * (value / 100);
    }

    if (this.service.discountType === 'FIXED_AMOUNT') {
      return Math.min(value, price);
    }

    return 0;
  }

  get finalAmount(): number {
    return this.originalAmount - this.discountAmount;
  }

  get discountLabel(): string {
    if (!this.service) {
      return '';
    }

    if (this.service.discountType === 'PERCENTAGE') {
      return `${this.service.discountValue}%`;
    }

    return `$${Number(this.service.discountValue).toFixed(2)}`;
  }

  applyDiscount(): void {
    if (!this.service || !this.token || this.loading) {
      return;
    }

    const serviceId = this.service.documentId;

    if (!serviceId) {
      this.error = 'El servicio seleccionado no tiene un identificador válido.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.businessService.registerVisit(this.token).subscribe({
      next: (visitResponse) => {
        const visitId =
          visitResponse?.data?.visit?.documentId ??
          visitResponse?.data?.visit?.id;

        if (!visitId) {
          this.loading = false;
          this.error =
            'La visita fue registrada, pero no se obtuvo su identificador.';
          return;
        }

        this.businessService.applyDiscount(visitId, serviceId).subscribe({
          next: (discountResponse) => {
            this.loading = false;

            this.discountResult = discountResponse;
            this.showSuccessModal = true;
          },

          error: (error) => {
            console.error('Error aplicando descuento:', error);

            this.loading = false;

            this.error =
              error?.error?.error?.message ??
              error?.error?.message ??
              'No fue posible aplicar el descuento.';
          },
        });
      },

      error: (error) => {
        console.error('Error registrando visita:', error);

        this.loading = false;

        this.error =
          error?.error?.error?.message ??
          error?.error?.message ??
          'No fue posible registrar la visita.';
      },
    });
  }
  cancel(): void {
    this.router.navigate(['/business/select-service'], {
      state: {
        validation: this.validation,
        token: this.token,
      },
    });
  }

  acceptDiscount(): void {
    this.showSuccessModal = false;

    this.router.navigate(['/business/account']);
  }
}
