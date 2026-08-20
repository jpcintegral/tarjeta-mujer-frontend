import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { BusinessService } from '../../../core/services/business.service';
import { BusinessService as BusinessServiceModel } from '../../../core/models/business-service.model';
import { LucideAngularModule, Search } from 'lucide-angular';
@Component({
  selector: 'app-select-service',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './select-service.component.html',
  styleUrl: './select-service.component.scss',
})
export class SelectServiceComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly businessService = inject(BusinessService);
  readonly Search = Search;
  validation: any = null;
  token: string | null = null;

  services: BusinessServiceModel[] = [];
  filteredServices: BusinessServiceModel[] = [];
  selectedService: BusinessServiceModel | null = null;

  loading = false;
  error = '';
  searchTerm = '';

  ngOnInit(): void {
    this.validation = history.state?.validation;
    this.token = history.state?.token;
    if (!this.validation) {
      this.router.navigate(['/business/scan-card']);
      return;
    }

    this.loadServices();
  }

  loadServices(): void {
    const currentUser = this.authService.getCurrentUser('BUSINESS');

    if (!currentUser) {
      this.router.navigate(['/business/login']);
      return;
    }

    this.loading = true;
    this.error = '';

    this.businessService.getMyBusiness().subscribe({
      next: (business) => {
        // Normalize relations to BusinessServiceModel ensuring required fields (like name) are present
        this.services = (business?.services ?? [])
          .map((service) => ({ ...(service as any), name: service.name ?? '' }))
          .filter(
            (service) => service.active === true,
          ) as BusinessServiceModel[];

        this.filteredServices = [...this.services];

        this.loading = false;
      },

      error: (error) => {
        console.error('Error obteniendo servicios del negocio:', error);

        this.loading = false;

        this.error =
          error?.error?.error?.message ??
          error?.error?.message ??
          'No fue posible cargar los servicios del negocio.';
      },
    });
  }

  filterServices(): void {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      this.filteredServices = [...this.services];
      return;
    }

    this.filteredServices = this.services.filter((service) =>
      service.name.toLowerCase().includes(term),
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredServices = [...this.services];
  }

  selectService(service: BusinessServiceModel): void {
    this.selectedService = service;
  }

  continue(): void {
    if (!this.selectedService || !this.validation) {
      return;
    }

    this.router.navigate(['/business/confirm-discount'], {
      state: {
        validation: this.validation,
        service: this.selectedService,
        token: this.token,
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/business/scan-card']);
  }
}
