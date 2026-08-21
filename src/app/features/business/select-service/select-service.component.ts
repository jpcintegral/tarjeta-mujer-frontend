import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { BusinessService } from '../../../core/services/business.service';
import { BusinessServiceService } from '../../../core/services/business-service.service';
import { BusinessService as BusinessServiceModel } from '../../../core/models/business-service.model';
import { LucideAngularModule, Search } from 'lucide-angular';

@Component({
  selector: 'app-select-service',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './select-service.component.html',
  styleUrl: './select-service.component.scss',
})
export class SelectServiceComponent
  implements OnInit, AfterViewChecked, OnDestroy
{
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly businessService = inject(BusinessService);
  private readonly businessServiceService = inject(BusinessServiceService);

  readonly Search = Search;

  @ViewChild('servicesList')
  servicesList?: ElementRef<HTMLElement>;

  @ViewChild('loadMoreTrigger')
  loadMoreTrigger?: ElementRef<HTMLElement>;

  validation: any = null;
  token: string | null = null;

  services: BusinessServiceModel[] = [];
  filteredServices: BusinessServiceModel[] = [];
  selectedService: BusinessServiceModel | null = null;

  loading = false;
  error = '';
  searchTerm = '';

  page = 1;
  pageSize = 2;
  pageCount = 1;
  total = 0;

  private businessId: string | number | null = null;

  private observer?: IntersectionObserver;
  private observedElement?: HTMLElement;

  private searchTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.validation = history.state?.validation;
    this.token = history.state?.token;

    if (!this.validation) {
      this.router.navigate(['/business/scan-card']);
      return;
    }

    this.loadServices();
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
    const list = this.servicesList?.nativeElement;
    const element = this.loadMoreTrigger?.nativeElement;

    if (!list || !element) {
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
        root: list,
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
    const currentUser = this.authService.getCurrentUser('BUSINESS');

    if (!currentUser) {
      this.router.navigate(['/business/login']);
      return;
    }

    this.loading = true;

    if (!append) {
      this.error = '';
    }

    this.businessService.getMyBusiness().subscribe({
      next: (business) => {
        const id = business?.documentId;

        if (!id) {
          this.loading = false;
          this.error = 'No fue posible identificar el negocio del usuario.';
          return;
        }

        this.businessId = id;

        this.businessServiceService
          .getByBusiness(
            String(this.businessId),
            this.page,
            this.pageSize,
            this.searchTerm.trim() || undefined,
            'createdAt',
          )
          .subscribe({
            next: (response: any) => {
              const newServices = (response?.data ?? [])
                .map((service: any) => ({
                  ...service,
                  name: service.name ?? '',
                }))
                .filter(
                  (service: BusinessServiceModel) => service.active === true,
                ) as BusinessServiceModel[];

              const pagination = response?.pagination;

              this.pageCount = Number(pagination?.pageCount ?? 1);

              this.total = Number(pagination?.total ?? newServices.length);

              if (append) {
                this.services = [...this.services, ...newServices];
              } else {
                this.services = [...newServices];
              }

              this.filteredServices = [...this.services];

              this.loading = false;

              setTimeout(() => {
                this.setupInfiniteScroll();
              });
            },

            error: (error) => {
              console.error('Error obteniendo servicios del negocio:', error);

              this.loading = false;

              if (!append) {
                this.services = [];
                this.filteredServices = [];
              }

              this.error =
                error?.error?.error?.message ??
                error?.error?.message ??
                'No fue posible cargar los servicios del negocio.';
            },
          });
      },

      error: (error) => {
        console.error('Error obteniendo el negocio:', error);

        this.loading = false;

        this.error =
          error?.error?.error?.message ??
          error?.error?.message ??
          'No fue posible cargar los servicios del negocio.';
      },
    });
  }

  // ============================================================
  // BUSCAR
  // ============================================================

  filterServices(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.page = 1;
      this.loadServices();
    }, 300);
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
  // SELECCIONAR SERVICIO
  // ============================================================

  selectService(service: BusinessServiceModel): void {
    this.selectedService = service;
  }

  // ============================================================
  // CONTINUAR
  // ============================================================

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

  // ============================================================
  // CANCELAR
  // ============================================================

  cancel(): void {
    this.router.navigate(['/business/account']);
  }
}
