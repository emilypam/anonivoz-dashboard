import { Component, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../core/services/api.service';
import { LoginLog } from '../../core/models';

@Component({
  selector: 'app-audit-log',
  imports: [MatIconModule, MatProgressSpinnerModule],
  templateUrl: './audit-log.html',
  styleUrl: './audit-log.scss',
})
export class AuditLogComponent implements OnInit {
  loading = signal(true);
  logs = signal<LoginLog[]>([]);
  error = signal('');

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getLoginLogs(200).subscribe({
      next: (data) => { this.logs.set(data); this.loading.set(false); },
      error: () => { this.error.set('No se pudo cargar el historial.'); this.loading.set(false); },
    });
  }

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
