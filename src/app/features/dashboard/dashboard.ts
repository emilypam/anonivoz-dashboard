import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../core/services/api.service';
import { Report, Stats, LABELS } from '../../core/models';

interface ChartEntry {
  label: string;
  value: number;
  color: string;
}

interface StatCard {
  label: string;
  value: number;
  sub: string;
  icon: string;
  color: string;
  popupTitle: string;
  chart: ChartEntry[];
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
        {
          label: 'Total de denuncias', value: s.total, sub: 'acumuladas', icon: 'folder_open', color: 'blue',
          popupTitle: 'Por estado',
          chart: [
            { label: 'Pendiente',    value: s.byStatus['PENDING']    ?? 0, color: '#F97316' },
            { label: 'En revisión',  value: s.byStatus['IN_REVIEW']  ?? 0, color: '#6366F1' },
            { label: 'Resuelto',     value: s.byStatus['RESOLVED']   ?? 0, color: '#10B981' },
            { label: 'Desestimado',  value: s.byStatus['DISMISSED']  ?? 0, color: '#475569' },
          ],
        },
        {
          label: 'Últimos 7 días', value: s.last7Days, sub: 'nuevas esta semana', icon: 'calendar_today', color: 'teal',
          popupTitle: 'Esta semana vs anteriores',
          chart: [
            { label: 'Esta semana', value: s.last7Days,              color: '#34D399' },
            { label: 'Anteriores',  value: s.total - s.last7Days,    color: '#334155' },
          ],
        },
        {
          label: 'Pendientes', value: s.pending, sub: 'sin atender', icon: 'hourglass_empty', color: s.pending > 0 ? 'orange' : 'teal',
          popupTitle: 'Distribución por prioridad',
          chart: [
            { label: 'Urgente', value: s.byPriority['URGENT'] ?? 0, color: '#EF4444' },
            { label: 'Alta',    value: s.byPriority['HIGH']   ?? 0, color: '#F97316' },
            { label: 'Media',   value: s.byPriority['MEDIUM'] ?? 0, color: '#6366F1' },
            { label: 'Baja',    value: s.byPriority['LOW']    ?? 0, color: '#475569' },
          ],
        },
        {
          label: 'Urgentes', value: s.urgent, sub: 'requieren atención', icon: 'warning', color: s.urgent > 0 ? 'red' : 'teal',
          popupTitle: 'Tipo de acoso',
          chart: [
            { label: 'Físico',     value: s.byHarassmentType['PHYSICAL']      ?? 0, color: '#EF4444' },
            { label: 'Ciberacoso', value: s.byHarassmentType['CYBERBULLYING'] ?? 0, color: '#6366F1' },
            { label: 'Verbal',     value: s.byHarassmentType['VERBAL']        ?? 0, color: '#F97316' },
            { label: 'Social',     value: s.byHarassmentType['SOCIAL']        ?? 0, color: '#10B981' },
          ],
        },
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

  popupPct(chart: ChartEntry[], value: number): number {
    const max = Math.max(...chart.map(e => e.value), 1);
    return Math.round((value / max) * 100);
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
