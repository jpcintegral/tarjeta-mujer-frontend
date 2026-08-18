import { Routes } from '@angular/router';

import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';

import { HomeComponent } from './features/public/home/home.component';

import { ServicesComponent } from './features/public/services/services.component';

import { ServiceDetailComponent } from './features/public/service-detail/service-detail.component';

import { LoginComponent } from './features/auth/login/login.component';

import { RegisterComponent } from './features/auth/register/register.component';
import { WomanLayoutComponent } from './features/woman/layout/woman-layout/woman-layout.component';
import { DashboardComponent } from './features/woman/pages/dashboard/dashboard.component';
import { ProfileComponent } from './features/woman/pages/profile/profile.component';
import { CardComponent } from './features/woman/pages/card/card.component';
import { AccountComponent } from './features/woman/pages/account/account.component';

export const routes: Routes = [
  {
    path: '',

    component: PublicLayoutComponent,

    children: [
      {
        path: '',

        component: HomeComponent,
      },

      {
        path: 'servicios',

        component: ServicesComponent,
      },

      {
        path: 'servicios/:documentId',

        component: ServiceDetailComponent,
      },

      {
        path: 'login',

        component: LoginComponent,
      },
      {
        path: 'register',

        component: RegisterComponent,
      },
      {
        path: 'mujer',
        component: WomanLayoutComponent,
        children: [
          {
            path: '',
            redirectTo: 'account',
            pathMatch: 'full',
          },
          {
            path: 'account',
            component: AccountComponent,
          },
          {
            path: 'dashboard',
            component: DashboardComponent,
          },
          {
            path: 'profile',
            component: ProfileComponent,
          },
          {
            path: 'card',
            component: CardComponent,
          },
        ],
      },
    ],
  },

  {
    path: '**',

    redirectTo: '',
  },
];
