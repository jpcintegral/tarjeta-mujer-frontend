import { Routes } from '@angular/router';

import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { WomanLayoutComponent } from './layout/woman-layout/woman-layout.component';

import { HomeComponent } from './features/public/home/home.component';
import { ServicesComponent } from './features/public/services/services.component';
import { ServiceDetailComponent } from './features/public/service-detail/service-detail.component';

import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';

import { DashboardComponent } from './features/woman/dashboard/dashboard.component';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  /*
   * =====================================================
   * PUBLIC
   * =====================================================
   */
  {
    path: '',
    component: PublicLayoutComponent,
    children: [

      {
        path: '',
        component: HomeComponent
      },

      {
        path: 'beneficios',
        component: ServicesComponent
      },

      {
        path: 'beneficios/:id',
        component: ServiceDetailComponent
      },

      {
        path: 'login',
        component: LoginComponent
      },

      {
        path: 'registro',
        component: RegisterComponent
      }

    ]
  },

  /*
   * =====================================================
   * WOMAN
   * =====================================================
   */
  {
    path: 'mujer',
    component: WomanLayoutComponent,
    canActivate: [authGuard],
    children: [

      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },

      {
        path: 'dashboard',
        component: DashboardComponent
      }

    ]
  },

  /*
   * =====================================================
   * FALLBACK
   * =====================================================
   */
  {
    path: '**',
    redirectTo: ''
  }

];