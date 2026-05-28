import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../core/services/api.service';
import { Report, Stats, LABELS } from '../../core/models';

interface StatCard {
  label: string;
  value: number;
  sub: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, MatButtonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  stats = signal<Stats | null>(null);
  recent = signal<Report[]>([]);
  loading = signal(true);
  labels = LABELS;

  statCards = signal<StatCard[]>([]);

  constructor(
    private api: ApiService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.api.getStats().subscribe((s) => {
      this.stats.set(s);
      this.statCards.set([
        { label: 'Total de denuncias', value: s.total,     sub: 'acumuladas',              icon: 'folder_open',     color: 'blue'   },
        { label: 'Últimos 7 días',     value: s.last7Days, sub: 'nuevas esta semana',       icon: 'calendar_today',  color: 'teal'   },
        { label: 'Pendientes',         value: s.pending,   sub: 'sin atender',              icon: 'hourglass_empty', color: s.pending > 0 ? 'orange' : 'teal' },
        { label: 'Urgentes',           value: s.urgent,    sub: 'requieren atención',       icon: 'warning',         color: s.urgent > 0  ? 'red'    : 'teal' },
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

  goToReports() {
    this.router.navigate(['/reports']);
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
    return Object.entries(s.byHarassmentType)
      .map(([k, v]) => ({
        label: this.harassment(k),
        value: v as number,
        pct: s.total > 0 ? Math.round(((v as number) / s.total) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }

  statusEntries() {
    const s = this.stats();
    if (!s) return [];
    const order = ['PENDING', 'IN_REVIEW', 'RESOLVED', 'DISMISSED'];
    const total = s.total || 1;
    return order.map((k) => {
      const value = (s.byStatus as Record<string, number>)[k] ?? 0;
      return {
        key: k,
        label: this.statusLabel(k),
        value,
        pct: Math.round((value / total) * 100),
      };
    });
  }
}
