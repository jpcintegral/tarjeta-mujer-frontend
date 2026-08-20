import { AdminApiToken } from './../../../../../../red-mujeres-backend/types/generated/contentTypes.d';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgxScannerQrcodeComponent,
  ScannerQRCodeConfig,
} from 'ngx-scanner-qrcode';
import { Router } from '@angular/router';

import { BusinessService } from '../../../core/services/business.service';

@Component({
  selector: 'app-scan-card',
  standalone: true,
  imports: [CommonModule, NgxScannerQrcodeComponent],
  templateUrl: './scan-card.component.html',
  styleUrl: './scan-card.component.scss',
})
export class ScanCardComponent implements AfterViewInit {
  @ViewChild('scanner')
  scanner?: NgxScannerQrcodeComponent;

  loading = false;

  errorMessage = '';

  scanned = false;

  config: ScannerQRCodeConfig = {
    constraints: {
      video: {
        facingMode: 'environment',
      },
    },
  };

  constructor(
    private readonly businessService: BusinessService,
    private readonly router: Router,
  ) {}

  ngAfterViewInit(): void {
    this.startScanner();
  }

  startScanner(): void {
    if (!this.scanner) {
      return;
    }

    this.scanner.start();
  }

  onScan(result: any): void {
    if (this.scanned || this.loading) {
      return;
    }
    console.log('entro a validad QR:', result);
    const token = Array.isArray(result) ? result[0]?.value : result?.value;

    if (!token) {
      return;
    }

    this.scanned = true;
    this.loading = true;
    this.errorMessage = '';

    this.businessService.validateCard(token).subscribe({
      next: (response) => {
        this.loading = false;

        this.router.navigate(['/business/card-validation'], {
          state: {
            validation: response,
            token: token,
          },
        });
      },

      error: (error) => {
        console.error('Error validando tarjeta:', error);

        this.loading = false;
        this.scanned = false;

        this.errorMessage =
          error?.error?.error?.message ??
          error?.error?.message ??
          'La tarjeta no es válida.';
      },
    });
  }

  cancel(): void {
    this.stopScanner();

    this.router.navigate(['/business/account']);
  }

  stopScanner(): void {
    this.scanner?.stop();
  }
}
