import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-woman-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './woman-layout.component.html',
  styleUrl: './woman-layout.component.scss',
})
export class WomanLayoutComponent {
  user = this.getUser();

  getUser(): any {
    const user = localStorage.getItem('tarjeta_mujer_user');

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem('tarjeta_mujer_token');
    localStorage.removeItem('tarjeta_mujer_user');

    window.location.href = '/login';
  }
}
