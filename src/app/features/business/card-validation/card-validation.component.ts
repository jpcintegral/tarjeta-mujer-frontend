import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-card-validation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-validation.component.html',
  styleUrl: './card-validation.component.scss',
})
export class CardValidationComponent implements OnInit {
  validation: any = null;
  token: string | null = null;
  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.validation = history.state?.validation;
    this.token = history.state?.token;
    if (!this.validation) {
      this.router.navigate(['/business/scan-card']);
    }
  }

  cancel(): void {
    this.router.navigate(['/business/scan-card']);
  }

  continue(): void {
    if (!this.validation) {
      return;
    }

    this.router.navigate(['/business/select-service'], {
      state: {
        validation: this.validation,
        token: this.token,
      },
    });
  }
}
