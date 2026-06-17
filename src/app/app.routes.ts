import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./features/layout/layout').then((m) => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports-list/reports-list').then(
            (m) => m.ReportsListComponent,
          ),
      },
      {
        path: 'reports/:id',
        loadComponent: () =>
          import('./features/reports/report-detail/report-detail').then(
            (m) => m.ReportDetailComponent,
          ),
      },
      {
        path: 'staff',
        loadComponent: () =>
          import('./features/staff/staff').then((m) => m.StaffComponent),
      },
      {
        path: 'institutions',
        loadComponent: () =>
          import('./features/institutions/institutions').then((m) => m.InstitutionsComponent),
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./features/analytics/analytics').then((m) => m.AnalyticsComponent),
      },
      {
        path: 'audit',
        loadComponent: () =>
          import('./features/audit-log/audit-log').then((m) => m.AuditLogComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
