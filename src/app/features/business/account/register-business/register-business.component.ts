import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { BusinessService } from '../../../../core/services/business.service';
import { Business } from '../../../../core/models/business.model';

@Component({
  selector: 'app-register-business',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-business.component.html',
  styleUrl: './register-business.component.scss',
})
export class RegisterBusinessComponent implements OnInit {
  // ============================================================
  // FORMULARIO
  // ============================================================

  businessForm: FormGroup;

  // ============================================================
  // ESTADO
  // ============================================================

  loading = false;

  errorMessage = '';

  successMessage = '';

  submitted = false;

  // ============================================================
  // EDICIÓN
  // ============================================================

  editing = false;

  business: Business | null = null;

  // ============================================================
  // PREVISUALIZACIÓN
  // ============================================================

  logoPreview: string | null = null;

  bannerPreview: string | null = null;

  logoFile: File | null = null;

  bannerFile: File | null = null;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly businessService: BusinessService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {
    this.businessForm = this.formBuilder.group({
      // --------------------------------------------------------
      // INFORMACIÓN PRINCIPAL
      // --------------------------------------------------------

      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(150),
        ],
      ],

      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(1000),
        ],
      ],

      // --------------------------------------------------------
      // CONTACTO
      // --------------------------------------------------------

      phone: ['', [Validators.required, Validators.maxLength(30)]],

      email: ['', [Validators.required, Validators.email]],

      website: ['', [Validators.maxLength(255)]],

      // --------------------------------------------------------
      // DIRECCIÓN
      // --------------------------------------------------------

      address: ['', [Validators.maxLength(500)]],

      // --------------------------------------------------------
      // CATEGORÍA
      // --------------------------------------------------------

      category: [null],
    });
  }

  // ============================================================
  // INIT
  // ============================================================

  ngOnInit(): void {
    const editing = this.route.snapshot.queryParamMap.get('edit');

    if (editing === 'true') {
      this.loadBusiness();
    }
  }

  // ============================================================
  // GETTERS
  // ============================================================

  get name() {
    return this.businessForm.get('name');
  }

  get description() {
    return this.businessForm.get('description');
  }

  get phone() {
    return this.businessForm.get('phone');
  }

  get email() {
    return this.businessForm.get('email');
  }

  get website() {
    return this.businessForm.get('website');
  }

  get address() {
    return this.businessForm.get('address');
  }

  get category() {
    return this.businessForm.get('category');
  }

  // ============================================================
  // CARGAR NEGOCIO PARA EDICIÓN
  // ============================================================

  loadBusiness(): void {
    this.loading = true;

    this.errorMessage = '';

    this.businessService.getMyBusiness().subscribe({
      next: (business) => {
        this.business = business;

        if (!business) {
          this.loading = false;
          return;
        }

        this.editing = true;

        this.businessForm.patchValue({
          name: business.name ?? '',
          description: business.description ?? '',
          phone: business.phone ?? '',
          email: business.email ?? '',
          website: business.website ?? '',
          address: business.address ?? '',
          category: business.category?.documentId ?? null,
        });

        // ------------------------------------------------------
        // IMAGEN ACTUAL DEL LOGO
        // ------------------------------------------------------

        this.logoPreview =
          business.logo?.formats?.small?.url ??
          business.logo?.formats?.thumbnail?.url ??
          business.logo?.url ??
          null;

        // ------------------------------------------------------
        // IMAGEN ACTUAL DEL BANNER
        // ------------------------------------------------------

        this.bannerPreview =
          business.banner?.formats?.large?.url ??
          business.banner?.formats?.medium?.url ??
          business.banner?.formats?.small?.url ??
          business.banner?.url ??
          null;

        this.loading = false;
      },

      error: (error) => {
        console.error('Error cargando negocio:', error);

        this.loading = false;

        this.errorMessage =
          error?.error?.error?.message ??
          error?.error?.message ??
          'No fue posible cargar la información del negocio.';
      },
    });
  }

  // ============================================================
  // LOGO
  // ============================================================

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'El logo debe ser una imagen válida.';

      return;
    }

    this.logoFile = file;

    const reader = new FileReader();

    reader.onload = () => {
      this.logoPreview = reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  // ============================================================
  // BANNER
  // ============================================================

  onBannerSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'El banner debe ser una imagen válida.';

      return;
    }

    this.bannerFile = file;

    const reader = new FileReader();

    reader.onload = () => {
      this.bannerPreview = reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  // ============================================================
  // SUBMIT
  // ============================================================

  onSubmit(): void {
    this.submitted = true;

    this.errorMessage = '';

    this.successMessage = '';

    if (this.businessForm.invalid) {
      this.businessForm.markAllAsTouched();

      return;
    }

    this.loading = true;

    const businessData = {
      name: this.name?.value?.trim(),

      description: this.description?.value?.trim(),

      phone: this.phone?.value?.trim(),

      email: this.email?.value?.trim(),

      website: this.website?.value?.trim() || undefined,

      address: this.address?.value?.trim() || undefined,

      category: this.category?.value || undefined,
    };

    console.log(
      this.editing ? 'Actualizando negocio:' : 'Registrando negocio:',
      businessData,
    );

    // ========================================================
    // ACTUALIZAR
    // ========================================================

    if (this.editing && this.business?.documentId) {
      this.businessService
        .update(this.business.documentId, businessData)
        .subscribe({
          next: (response) => {
            console.log('Negocio actualizado:', response);

            this.loading = false;

            this.successMessage =
              'La información de tu negocio fue actualizada correctamente.';

            setTimeout(() => {
              this.router.navigate(['/business/account']);
            }, 1000);
          },

          error: (error) => {
            console.error('Error actualizando negocio:', error);

            this.loading = false;

            this.errorMessage =
              error?.error?.error?.message ??
              error?.error?.message ??
              'No fue posible actualizar el negocio.';
          },
        });

      return;
    }

    // ========================================================
    // REGISTRAR
    // ========================================================

    this.businessService.register(businessData).subscribe({
      next: (response) => {
        console.log('Negocio registrado:', response);

        this.loading = false;

        this.successMessage =
          'Tu negocio fue registrado correctamente y está pendiente de aprobación.';

        setTimeout(() => {
          this.router.navigate(['/business/account']);
        }, 1000);
      },

      error: (error) => {
        console.error('Error registrando negocio:', error);

        this.loading = false;

        this.errorMessage =
          error?.error?.error?.message ??
          error?.error?.message ??
          'No fue posible registrar el negocio.';
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
