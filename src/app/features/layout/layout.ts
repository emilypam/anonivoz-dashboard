import { Component, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class LayoutComponent {
  navItems: NavItem[] = [
    { path: '/dashboard', label: 'Resumen', icon: 'grid_view' },
    { path: '/reports', label: 'Denuncias', icon: 'folder_open' },
    { path: '/staff', label: 'Personal DECE', icon: 'group' },
  ];

  user = computed(() => this.auth.currentUser());
  initials = computed(() => {
    const name = this.auth.currentUser()?.name ?? '';
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  });

  constructor(private auth: AuthService) {}

  logout() {
    this.auth.logout();
  }
}
