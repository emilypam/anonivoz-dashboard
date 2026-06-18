import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../core/services/api.service';
import { LoginLog } from '../../core/models';

@Component({
  selector: 'app-audit-log',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
  ],
  templateUrl: './audit-log.html',
  styleUrl: './audit-log.scss',
})
export class AuditLogComponent implements OnInit {
  loading = signal(true);
  logs = signal<LoginLog[]>([]);
  error = signal('');

  filterRole = '';
  pageIndex = 0;
  readonly pageSize = 50;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getLoginLogs(500).subscribe({
      next: (data) => { this.logs.set(data); this.loading.set(false); },
      error: () => { this.error.set('No se pudo cargar el historial.'); this.loading.set(false); },
    });
  }

  get filteredLogs(): LoginLog[] {
    const all = this.logs();
    if (!this.filterRole) return all;
    if (this.filterRole === 'ADMIN') return all.filter(l => l.userType === 'admin');
    return all.filter(l => l.userRole === this.filterRole);
  }

  get pagedLogs(): LoginLog[] {
    const start = this.pageIndex * this.pageSize;
    return this.filteredLogs.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredLogs.length / this.pageSize);
  }

  onFilterChange() { this.pageIndex = 0; }
  prevPage() { if (this.pageIndex > 0) this.pageIndex--; }
  nextPage() { if (this.pageIndex < this.totalPages - 1) this.pageIndex++; }

  formatDate(iso: string) {
    return new Date(iso).toLocaleString('es-EC', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  roleLabel(role: string) {
    const map: Record<string, string> = {
      COUNSELOR: 'Consejero/a',
      COORDINATOR: 'Coordinador/a',
      DIRECTOR: 'Director/a',
      ADMIN: 'Administrador',
    };
    return map[role] ?? role;
  }
}
