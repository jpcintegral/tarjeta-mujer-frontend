import {
  Component,
  Input,
  EventEmitter,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BusinessService } from '../../../../core/models/business-service.model';
import { BusinessServiceService } from '../../../../core/services/business-service.service';
import { BusinessServiceRelation } from '../../../../core/models/business.model';
import { LucideAngularModule, Search } from 'lucide-angular';

@Component({
  selector: 'app-business-services',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './business-services.component.html',
  styleUrl: './business-services.component.scss',
})
export class BusinessServicesComponent implements OnChanges {
  readonly Search = Search;
  @Input() businessId?: string | number;

  @Input() services: BusinessServiceRelation[] = [];

  filteredServices: BusinessServiceRelation[] = [];

  searchTerm = '';

  editingService: BusinessServiceRelation | null = null;

  @Output() servicesChanged = new EventEmitter<BusinessServiceRelation[]>();

  loading = false;

  saving = false;

  showCreateForm = false;

  errorMessage = '';

  successMessage = '';

  form = {
    name: '',
    description: '',
    price: null as number | null,
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
    discountValue: null as number | null,
    validFrom: '',
    validUntil: '',
  };

  constructor(
    private readonly businessServiceService: BusinessServiceService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['services']) {
      this.filterServices();
    }
  }
  openCreateForm(): void {
    this.editingService = null;

    this.resetForm();

    this.showCreateForm = true;

    this.successMessage = '';

    this.errorMessage = '';
  }

  closeCreateForm(): void {
    this.showCreateForm = false;

    this.editingService = null;

    this.resetForm();
  }

  resetForm(): void {
    this.form = {
      name: '',
      description: '',
      price: null,
      discountType: 'PERCENTAGE',
      discountValue: null,
      validFrom: '',
      validUntil: '',
    };
  }

  filterServices(): void {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      this.filteredServices = [...this.services];
      return;
    }

    this.filteredServices = this.services.filter((service) =>
      (service.name ?? '').toLowerCase().includes(term),
    );
  }

  createService(): void {
    if (this.editingService) {
      this.updateService();
      return;
    }

    if (!this.businessId) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.form.name.trim()) {
      this.errorMessage = 'El nombre del servicio es obligatorio.';
      return;
    }

    if (!this.form.description.trim()) {
      this.errorMessage = 'La descripción del servicio es obligatoria.';
      return;
    }

    if (this.form.price == null || this.form.price < 0) {
      this.errorMessage = 'El precio es obligatorio.';
      return;
    }

    if (this.form.discountValue == null || this.form.discountValue < 0) {
      this.errorMessage = 'El valor del descuento es obligatorio.';
      return;
    }

    if (
      this.form.discountType === 'PERCENTAGE' &&
      this.form.discountValue > 100
    ) {
      this.errorMessage =
        'El porcentaje de descuento no puede ser mayor a 100%.';

      return;
    }

    this.saving = true;

    const payload: Partial<BusinessService> = {
      name: this.form.name.trim(),

      description: this.form.description.trim(),

      price: this.form.price,

      discountType: this.form.discountType,

      discountValue: this.form.discountValue,

      validFrom: this.form.validFrom || null,

      validUntil: this.form.validUntil || null,

      active: true,
    };

    this.businessServiceService.create(this.businessId, payload).subscribe({
      next: (response) => {
        this.saving = false;

        this.showCreateForm = false;

        this.successMessage = 'Servicio creado correctamente.';

        this.resetForm();

        const createdService = response?.data ?? response;

        if (createdService) {
          this.services = [...this.services, createdService];

          this.filterServices();

          this.servicesChanged.emit(this.services);
        }
      },

      error: (error) => {
        console.error('Error creando servicio:', error);

        this.saving = false;

        this.errorMessage =
          error?.error?.error?.message ??
          error?.error?.message ??
          'No fue posible crear el servicio.';
      },
    });
  }

  calculateFinalPrice(service: BusinessService): number | null {
    if (service.price == null || service.discountValue == null) {
      return null;
    }

    if (service.discountType === 'PERCENTAGE') {
      return service.price * (1 - service.discountValue / 100);
    }

    if (service.discountType === 'FIXED_AMOUNT') {
      return Math.max(0, service.price - service.discountValue);
    }

    return null;
  }

  calculateSavings(service: BusinessService): number | null {
    const finalPrice = this.calculateFinalPrice(service);

    if (finalPrice == null || service.price == null) {
      return null;
    }

    return service.price - finalPrice;
  }

  toggleServiceStatus(service: BusinessServiceRelation): void {
    if (!this.businessId || !service.documentId) {
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const newStatus = !service.active;

    this.businessServiceService
      .updateStatus(String(this.businessId), service.documentId, newStatus)
      .subscribe({
        next: () => {
          service.active = newStatus;

          this.saving = false;

          this.successMessage = newStatus
            ? 'Servicio activado correctamente.'
            : 'Servicio desactivado correctamente.';

          this.filterServices();
        },

        error: (error) => {
          console.error('Error actualizando estado del servicio:', error);

          this.saving = false;

          this.errorMessage =
            error?.error?.error?.message ??
            error?.error?.message ??
            'No fue posible actualizar el servicio.';
        },
      });
  }

  openEditForm(service: BusinessServiceRelation): void {
    this.editingService = service;

    this.form = {
      name: service.name ?? '',
      description: service.description ?? '',
      price: service.price ?? null,
      discountType: service.discountType ?? 'PERCENTAGE',
      discountValue: service.discountValue ?? null,
      validFrom: service.validFrom ?? '',
      validUntil: service.validUntil ?? '',
    };

    this.showCreateForm = true;

    this.successMessage = '';

    this.errorMessage = '';
  }

  updateService(): void {
    if (!this.businessId || !this.editingService?.documentId) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.form.name.trim()) {
      this.errorMessage = 'El nombre del servicio es obligatorio.';
      return;
    }

    if (!this.form.description.trim()) {
      this.errorMessage = 'La descripción del servicio es obligatoria.';
      return;
    }

    if (this.form.price == null || this.form.price < 0) {
      this.errorMessage = 'El precio es obligatorio.';
      return;
    }

    if (this.form.discountValue == null || this.form.discountValue < 0) {
      this.errorMessage = 'El valor del descuento es obligatorio.';
      return;
    }

    if (
      this.form.discountType === 'PERCENTAGE' &&
      this.form.discountValue > 100
    ) {
      this.errorMessage =
        'El porcentaje de descuento no puede ser mayor a 100%.';

      return;
    }

    this.saving = true;

    const documentId = this.editingService.documentId;

    const payload: Partial<BusinessService> = {
      name: this.form.name.trim(),
      description: this.form.description.trim(),
      price: this.form.price,
      discountType: this.form.discountType,
      discountValue: this.form.discountValue,
      validFrom: this.form.validFrom || null,
      validUntil: this.form.validUntil || null,
    };

    this.businessServiceService
      .update(this.businessId, documentId, payload)
      .subscribe({
        next: (response) => {
          const updatedService = response?.data ?? response;

          const updatedServices = this.services.map((service) =>
            service.documentId === documentId
              ? {
                  ...service,
                  ...updatedService,
                }
              : service,
          );

          this.services = updatedServices;

          this.filteredServices = [...updatedServices];

          this.filterServices();

          this.servicesChanged.emit(updatedServices);

          this.saving = false;

          this.showCreateForm = false;

          this.editingService = null;

          this.successMessage = 'Servicio actualizado correctamente.';

          this.resetForm();
        },

        error: (error) => {
          console.error('Error actualizando servicio:', error);

          this.saving = false;

          this.errorMessage =
            error?.error?.error?.message ??
            error?.error?.message ??
            'No fue posible actualizar el servicio.';
        },
      });
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredServices = [...this.services];
  }
}
