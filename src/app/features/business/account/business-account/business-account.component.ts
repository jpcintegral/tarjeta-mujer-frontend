import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Business,
  BusinessServiceRelation,
  StrapiMedia,
} from '../../../../core/models/business.model';
import { BusinessService } from '../../../../core/services/business.service';
import { BusinessServicesComponent } from '../services/business-services.component';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-business-account',
  standalone: true,
  imports: [CommonModule, BusinessServicesComponent],
  templateUrl: './business-account.component.html',
  styleUrl: './business-account.component.scss',
})
export class BusinessAccountComponent implements OnInit {
  business: Business | null = null;

  loading = true;
  errorMessage = '';
  private readonly router = inject(Router);
  constructor(private readonly businessService: BusinessService) {}

  ngOnInit(): void {
    this.loadBusiness();
  }

  loadBusiness(): void {
    this.loading = true;

    this.errorMessage = '';

    this.businessService.getMyBusiness().subscribe({
      next: (business) => {
        this.business = business;

        this.loading = false;
      },

      error: (error) => {
        console.error('Error obteniendo negocio:', error);

        this.loading = false;

        this.errorMessage =
          error?.error?.error?.message ??
          error?.error?.message ??
          'No fue posible cargar la información del negocio.';
      },
    });
  }

  getBannerUrl(): string | null {
    const banner = this.business?.banner;

    if (!banner) {
      return null;
    }

    return (
      banner.formats?.large?.url ??
      banner.formats?.medium?.url ??
      banner.formats?.small?.url ??
      banner.url ??
      null
    );
  }

  getLogoUrl(): string | null {
    const logo = this.business?.logo;

    if (!logo) {
      return null;
    }

    return (
      logo.formats?.small?.url ??
      logo.formats?.thumbnail?.url ??
      logo.url ??
      null
    );
  }

  getStatusLabel(status?: Business['statusBusiness']): string {
    switch (status) {
      case 'APPROVED':
        return 'NEGOCIO APROBADO';

      case 'PENDING':
        return 'PENDIENTE DE APROBACIÓN';

      case 'REJECTED':
        return 'NEGOCIO RECHAZADO';

      case 'SUSPENDED':
        return 'NEGOCIO SUSPENDIDO';

      default:
        return 'ESTADO DESCONOCIDO';
    }
  }

  getStatusClass(status?: Business['statusBusiness']): string {
    switch (status) {
      case 'APPROVED':
        return 'status-approved';

      case 'PENDING':
        return 'status-pending';

      case 'REJECTED':
        return 'status-rejected';

      case 'SUSPENDED':
        return 'status-suspended';

      default:
        return 'status-unknown';
    }
  }

  get fullAddress(): string {
    if (!this.business) {
      return '';
    }

    return this.business.address ?? '';
  }

  goToBusinessRegister(): void {
    this.router.navigate(['/business/register-business']);
  }

  onServicesChanged(services: BusinessServiceRelation[]): void {
    if (!this.business) {
      return;
    }

    this.business = {
      ...this.business,
      services,
    };
  }

  goToBusinessEdit(): void {
    this.router.navigate(['/business/register-business'], {
      queryParams: { edit: 'true' },
    });
  }
}
