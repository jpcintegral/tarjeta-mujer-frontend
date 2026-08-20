import { Component, OnInit, inject } from '@angular/core';

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
export class HomeComponent implements OnInit {
  private readonly publicServiceService = inject(PublicServiceService);
  private readonly router = inject(Router);

  services: PublicService[] = [];

  loading = false;

  error = '';

  search = '';

  page = 1;

  pageSize = 10;

  total = 0;

  pageCount = 0;
  sort = 'createdAt';

  readonly mapPin = MapPin;

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.loading = true;

    this.error = '';

    this.publicServiceService
      .getServices(this.page, this.pageSize, this.search)
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.error =
              response.message || 'No fue posible cargar los servicios.';

            this.services = [];

            this.loading = false;

            return;
          }

          this.services = response.data ?? [];

          this.total = response.pagination?.total ?? 0;

          this.pageCount = response.pagination?.pageCount ?? 0;

          this.loading = false;
        },

        error: (error) => {
          console.error('Error loading public services:', error);

          this.error = 'No fue posible cargar los beneficios.';

          this.services = [];

          this.loading = false;
        },
      });
  }

  onSearch(): void {
    this.page = 1;

    this.loadServices();
  }

  nextPage(): void {
    if (this.page < this.pageCount) {
      this.page++;

      this.loadServices();
    }
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;

      this.loadServices();
    }
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

  onSortChange(sort: string): void {
    if (this.sort === sort) {
      return;
    }

    this.sort = sort;

    if (sort === 'discountValue') {
      this.services.sort((a, b) => {
        return Number(b.discountValue ?? 0) - Number(a.discountValue ?? 0);
      });

      return;
    }

    // Fecha -> backend
    this.page = 1;
    this.loadServices();
  }
}
