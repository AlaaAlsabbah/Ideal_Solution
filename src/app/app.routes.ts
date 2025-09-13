import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule)
  },

  {
    path: 'add-user',
    loadChildren: () => import('./pages/add-user/add-user.module').then(m => m.AddUserModule)
  },
  {
    path: '**',
    redirectTo: 'dashboard' 
  }
];