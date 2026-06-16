import { Component, computed, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class LayoutComponent implements OnInit, OnDestroy {
  private allNavItems: NavItem[] = [
    { path: '/dashboard', label: 'Resumen', icon: 'grid_view' },
    { path: '/reports', label: 'Denuncias', icon: 'folder_open' },
    { path: '/staff', label: 'Personal DECE', icon: 'group' },
    { path: '/institutions', label: 'Instituciones', icon: 'apartment', adminOnly: true },
    { path: '/analytics', label: 'Uso del Bot', icon: 'bar_chart', adminOnly: true },
  ];

  user = computed(() => this.auth.currentUser());

  navItems = computed(() => {
    const isAdmin = this.auth.isAdmin();
    return this.allNavItems.filter((i) => !i.adminOnly || isAdmin);
  });

  initials = computed(() => {
    const name = this.auth.currentUser()?.name ?? '';
    return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
  });

  roleLabel = computed(() => {
    const u = this.auth.currentUser();
    if (!u) return '';
    if (u.isAdmin) return 'Administrador';
    const map: Record<string, string> = {
      COUNSELOR: 'Consejero/a',
      COORDINATOR: 'Coordinador/a',
      DIRECTOR: 'Director/a',
    };
    return map[u.role] ?? u.role;
  });

  pendingCount = signal(0);
  private refreshInterval?: ReturnType<typeof setInterval>;

  constructor(private auth: AuthService, private api: ApiService) {}

  ngOnInit() {
    this.fetchPending();
    this.refreshInterval = setInterval(() => this.fetchPending(), 60_000);
  }

  ngOnDestroy() {
    clearInterval(this.refreshInterval);
  }

  private fetchPending() {
    this.api.getStats().subscribe({ next: (s) => this.pendingCount.set(s.pending), error: () => {} });
  }

  logout() {
    this.auth.logout();
  }
}
