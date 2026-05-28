import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../core/services/api.service';
import { Report, Stats, LABELS } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  stats = signal<Stats | null>(null);
  recent = signal<Report[]>([]);
  loading = signal(true);
  labels = LABELS;

  statCards = signal<{ label: string; value: number; sub: string; accent: boolean }[]>([]);

  constructor(
    private api: ApiService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.api.getStats().subscribe((s) => {
      this.stats.set(s);
      this.statCards.set([
        { label: 'Total de denuncias', value: s.total, sub: 'acumuladas', accent: false },
        { label: 'Últimos 7 días', value: s.last7Days, sub: 'nuevas', accent: false },
        { label: 'Pendientes', value: s.pending, sub: 'sin atender', accent: s.pending > 0 },
        { label: 'Urgentes', value: s.urgent, sub: 'requieren atención inmediata', accent: s.urgent > 0 },
      ]);
    });

    this.api.getReports({ limit: 8, offset: 0 }).subscribe((res) => {
      this.recent.set(res.data);
      this.loading.set(false);
    });
  }

  openReport(id: string) {
    this.router.navigate(['/reports', id]);
  }

  harassment(type: string) {
    return this.labels.harassment[type as keyof typeof this.labels.harassment] ?? type;
  }

  statusLabel(s: string) {
    return this.labels.status[s as keyof typeof this.labels.status] ?? s;
  }

  priorityLabel(p: string) {
    return this.labels.priority[p as keyof typeof this.labels.priority] ?? p;
  }

  formatDate(d: string) {
    return new Date(d).toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  harassmentEntries() {
    const s = this.stats();
    if (!s) return [];
    return Object.entries(s.byHarassmentType).map(([k, v]) => ({
      label: this.harassment(k),
      value: v,
      pct: s.total > 0 ? Math.round((v / s.total) * 100) : 0,
    })).sort((a, b) => b.value - a.value);
  }

  statusEntries() {
    const s = this.stats();
    if (!s) return [];
    const order = ['PENDING', 'IN_REVIEW', 'RESOLVED', 'DISMISSED'];
    return order.map((k) => ({
      key: k,
      label: this.statusLabel(k),
      value: s.byStatus[k as keyof typeof s.byStatus] ?? 0,
    }));
  }
}
