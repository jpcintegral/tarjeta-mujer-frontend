import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { ActivatedRoute, Router } from '@angular/router';

import { PublicServiceService } from '../../../core/services/public-service.service';

import { PublicService } from '../../../core/models/public-service.model';
import { LucideAngularModule, MapPin } from 'lucide-angular';

@Component({
  selector: 'app-service-detail',

  standalone: true,

  imports: [CommonModule, LucideAngularModule],

  templateUrl: './service-detail.component.html',

  styleUrl: './service-detail.component.scss',
})
export class ServiceDetailComponent implements OnInit {
  /**
   * Servicio obtenido desde Strapi.
   */
  service: PublicService | null = null;

  /**
   * Estado de carga.
   */
  loading = true;

  /**
   * Mensaje de error.
   */
  error = false;
  readonly mapPin = MapPin;
  constructor(
    private readonly route: ActivatedRoute,

    private readonly router: Router,

    private readonly publicServiceService: PublicServiceService,
  ) {}

  ngOnInit(): void {
    /**
     * Obtener documentId desde la URL.
     *
     * Ejemplo:
     *
     * /servicios/ni484yujzfstzciha8inepbo
     */
    const documentId = this.route.snapshot.paramMap.get('documentId');

    if (!documentId) {
      console.error('No se recibió documentId en la ruta.');

      this.error = true;

      this.loading = false;

      return;
    }

    console.log('Consultando servicio:', documentId);

    this.loadService(documentId);
  }

  /**
   * ============================================================
   * CARGAR SERVICIO
   * ============================================================
   */
  private loadService(documentId: string): void {
    this.loading = true;

    this.error = false;

    this.publicServiceService.getService(documentId).subscribe({
      next: (service) => {
        console.log('Servicio recibido desde Strapi:', service);

        this.service = service;

        this.loading = false;
      },

      error: (error) => {
        console.error('Error obteniendo servicio:', error);

        this.service = null;

        this.error = true;

        this.loading = false;
      },
    });
  }

  /**
   * ============================================================
   * IMAGEN DEL COMERCIO
   * ============================================================
   *
   * Prioridad:
   *
   * 1. Banner
   * 2. Logo
   * 3. Imagen del servicio
   * 4. Placeholder
   */
  getBusinessImage(): string | null {
    if (!this.service) {
      return null;
    }

    return (
      this.publicServiceService.getImageUrl(this.service.image, 'medium') ??
      this.publicServiceService.getImageUrl(
        this.service.business.banner,
        'large',
      ) ??
      this.publicServiceService.getImageUrl(
        this.service.business.logo,
        'medium',
      )
    );
  }

  /**
   * ============================================================
   * REGRESAR A BENEFICIOS
   * ============================================================
   */
  goBack(): void {
    this.router.navigate(['/home']);
  }
}
