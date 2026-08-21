import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PublicServiceService } from '../../../core/services/public-service.service';
import { PublicService } from '../../../core/models/public-service.model';

import { Router } from '@angular/router';

import { LucideAngularModule, MapPin } from 'lucide-angular';

@Component({
  selector: 'app-home',

  imports: [CommonModule, FormsModule, LucideAngularModule],

  templateUrl: './home.component.html',

  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly publicServiceService = inject(PublicServiceService);

  private readonly router = inject(Router);

  private intersectionObserver?: IntersectionObserver;

  private observedElement?: HTMLDivElement;

  @ViewChild('loadMoreTrigger')
  set loadMoreTrigger(element: ElementRef<HTMLDivElement> | undefined) {
    if (!element) {
      return;
    }

    this.observedElement = element.nativeElement;

    this.observeLoadMoreTrigger(element.nativeElement);
  }

  services: PublicService[] = [];

  loading = false;

  error = '';

  search = '';

  page = 1;

  pageSize = 10;

  total = 0;

  pageCount = 0;

  sort = 'createdAt';

  hasMore = true;

  readonly mapPin = MapPin;

  ngOnInit(): void {
    this.loadServices(true);
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
  }

  private observeLoadMoreTrigger(element: HTMLDivElement): void {
    this.intersectionObserver?.disconnect();

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry?.isIntersecting) {
          return;
        }

        if (this.loading) {
          return;
        }

        if (!this.hasMore) {
          return;
        }

        this.loadNextPage();
      },
      {
        root: null,

        /*
         * Carga cuando el usuario está
         * realmente cerca del final.
         */
        rootMargin: '0px',

        threshold: 0,
      },
    );

    this.intersectionObserver.observe(element);
  }

  private loadNextPage(): void {
    if (this.loading || !this.hasMore) {
      return;
    }

    this.page++;

    this.loadServices();
  }

  loadServices(reset = false): void {
    if (this.loading) {
      return;
    }

    if (!reset && !this.hasMore) {
      return;
    }

    this.loading = true;

    this.error = '';

    this.publicServiceService
      .getServices(this.page, this.pageSize, this.search, undefined, this.sort)
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.error =
              response.message || 'No fue posible cargar los servicios.';

            if (reset) {
              this.services = [];
            }

            this.loading = false;

            return;
          }

          const newServices = response.data ?? [];

          if (reset) {
            this.services = newServices;
          } else {
            this.services = [...this.services, ...newServices];
          }

          this.total = response.pagination?.total ?? 0;

          this.pageCount = response.pagination?.pageCount ?? 0;

          this.hasMore = this.page < this.pageCount;

          this.loading = false;

          console.log('Página cargada:', this.page, {
            nuevos: newServices.length,
            total: this.services.length,
            pageCount: this.pageCount,
            hasMore: this.hasMore,
          });

          /*
           * IMPORTANTE:
           *
           * Angular puede haber reemplazado
           * el elemento del trigger al actualizar
           * *ngIf / DOM.
           *
           * El setter de @ViewChild se encargará
           * nuevamente de registrarlo.
           */
        },

        error: (error) => {
          console.error('Error loading public services:', error);

          this.error = 'No fue posible cargar los beneficios.';

          if (reset) {
            this.services = [];
          }

          this.loading = false;
        },
      });
  }

  onSearch(): void {
    this.page = 1;

    this.hasMore = true;

    this.services = [];

    this.intersectionObserver?.disconnect();

    this.observedElement = undefined;

    this.loadServices(true);
  }

  onSortChange(sort: string): void {
    if (this.sort === sort) {
      return;
    }

    this.sort = sort;

    this.page = 1;

    this.hasMore = true;

    this.services = [];

    this.intersectionObserver?.disconnect();

    this.observedElement = undefined;

    this.loadServices(true);
  }

  viewService(documentId: string): void {
    this.router.navigate(['/servicios', documentId]);
  }

  getBusinessImage(service: PublicService): string | null {
    return (
      this.publicServiceService.getImageUrl(service.image, 'medium') ??
      this.publicServiceService.getImageUrl(service.business.banner, 'small') ??
      this.publicServiceService.getImageUrl(service.business.logo, 'medium')
    );
  }
  scrollToBenefits(event: Event): void {
    event.preventDefault();

    const benefitsSection = document.getElementById('beneficios');

    if (benefitsSection) {
      benefitsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

  goToBusinessRegister(event: Event): void {
    event.preventDefault();

    this.router.navigate(['/business/register']);
  }
}
