import {
  AfterViewChecked,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  EventEmitter,
  SimpleChanges,
  ViewChild,
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
export class BusinessServicesComponent
  implements OnChanges, AfterViewChecked, OnDestroy
{
  readonly Search = Search;

  @Input() businessId?: string | number;

  @Input() services: BusinessServiceRelation[] = [];

  @Output() servicesChanged = new EventEmitter<BusinessServiceRelation[]>();

  @ViewChild('loadMoreTrigger')
  loadMoreTrigger?: ElementRef<HTMLElement>;

  loading = false;

  saving = false;

  showCreateForm = false;

  errorMessage = '';

  successMessage = '';

  searchTerm = '';

  sort = 'createdAt';

  page = 1;

  pageSize = 10;

  pageCount = 1;

  total = 0;

  private observer?: IntersectionObserver;

  private observedElement?: HTMLElement;

  private searchTimeout?: ReturnType<typeof setTimeout>;

  editingService: BusinessServiceRelation | null = null;

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

  // ============================================================
  // LIFECYCLE
  // ============================================================

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['businessId'] && this.businessId) {
      this.page = 1;
      this.loadServices();
    }
  }

  ngAfterViewChecked(): void {
    this.setupInfiniteScroll();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  // ============================================================
  // INFINITE SCROLL
  // ============================================================

  private setupInfiniteScroll(): void {
    const element = this.loadMoreTrigger?.nativeElement;

    if (!element) {
      return;
    }

    if (this.observedElement === element) {
      return;
    }

    this.observer?.disconnect();

    this.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (
          entry.isIntersecting &&
          !this.loading &&
          this.page < this.pageCount
        ) {
          this.loadMoreServices();
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1,
      },
    );

    this.observer.observe(element);

    this.observedElement = element;
  }

  loadMoreServices(): void {
    if (this.loading) {
      return;
    }

    if (this.page >= this.pageCount) {
      return;
    }

    this.page++;

    this.loadServices(true);
  }

  // ============================================================
  // CARGAR SERVICIOS
  // ============================================================

  loadServices(append = false): void {
    if (!this.businessId) {
      return;
    }

    this.loading = true;

    if (!append) {
      this.errorMessage = '';
    }

    this.businessServiceService
      .getByBusiness(
        String(this.businessId),
        this.page,
        this.pageSize,
        this.searchTerm.trim() || undefined,
        this.sort,
      )
      .subscribe({
        next: (response: any) => {
          const newServices = response?.data ?? [];

          const pagination = response?.pagination;

          this.pageCount = Number(pagination?.pageCount ?? 1);

          this.total = Number(pagination?.total ?? newServices.length);

          if (append) {
            this.services = [...this.services, ...newServices];
          } else {
            this.services = [...newServices];
          }

          this.loading = false;

          this.servicesChanged.emit(this.services);

          // ======================================================
          // IMPORTANTE:
          // Liberamos el elemento observado para que Angular pueda
          // volver a registrar el IntersectionObserver después de
          // pintar los nuevos servicios.
          // ======================================================

          this.observer?.disconnect();
          this.observedElement = undefined;

          setTimeout(() => {
            this.setupInfiniteScroll();
          }, 0);
        },

        error: (error) => {
          console.error('Error cargando servicios:', error);

          this.loading = false;

          if (!append) {
            this.services = [];
          }

          this.observer?.disconnect();
          this.observedElement = undefined;

          this.errorMessage =
            error?.error?.error?.message ??
            error?.error?.message ??
            'No fue posible cargar los servicios.';
        },
      });
  }

  // ============================================================
  // BUSCAR
  // ============================================================

  onSearch(): void {
    this.page = 1;

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.loadServices();
    }, 300);
  }

  // ============================================================
  // ORDENAMIENTO
  // ============================================================

  onSortChange(): void {
    this.page = 1;

    this.loadServices();
  }

  // ============================================================
  // LIMPIAR BÚSQUEDA
  // ============================================================

  clearSearch(): void {
    this.searchTerm = '';

    this.page = 1;

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.loadServices();
  }

  // ============================================================
  // CREAR FORMULARIO
  // ============================================================

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

  // ============================================================
  // CREAR SERVICIO
  // ============================================================

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

    this.businessServiceService
      .create(String(this.businessId), payload)
      .subscribe({
        next: () => {
          this.saving = false;

          this.showCreateForm = false;

          this.successMessage = 'Servicio creado correctamente.';

          this.resetForm();

          this.page = 1;

          this.observer?.disconnect();
          this.observedElement = undefined;

          this.loadServices();
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

  // ============================================================
  // CALCULAR PRECIO
  // ============================================================

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

  // ============================================================
  // CAMBIAR ESTADO
  // ============================================================

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

          this.servicesChanged.emit([...this.services]);
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

  // ============================================================
  // EDITAR
  // ============================================================

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

  // ============================================================
  // ACTUALIZAR
  // ============================================================

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
      .update(String(this.businessId), documentId, payload)
      .subscribe({
        next: () => {
          this.saving = false;

          this.showCreateForm = false;

          this.editingService = null;

          this.successMessage = 'Servicio actualizado correctamente.';

          this.resetForm();

          this.page = 1;

          this.observer?.disconnect();
          this.observedElement = undefined;

          this.loadServices();
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
}
