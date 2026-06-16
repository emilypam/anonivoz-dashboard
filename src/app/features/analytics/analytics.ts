import { Component, OnInit, signal, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../core/services/api.service';
import { BotUsageStats, BotUsageTimeline, BotUsageByInstitution } from '../../core/models';

@Component({
  selector: 'app-analytics',
  imports: [MatIconModule, MatProgressSpinnerModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss',
})
export class AnalyticsComponent implements OnInit {
  loading = signal(true);
  error = signal('');
  stats = signal<BotUsageStats | null>(null);
  activeCard = signal<number | null>(null);

  funnelMax = computed(() => {
    const s = this.stats();
    if (!s) return 1;
    return Math.max(s.totalStarts, 1);
  });

  timelineMax = computed(() => {
    const s = this.stats();
    if (!s || !s.timeline.length) return 1;
    return Math.max(...s.timeline.map((d) => d.starts), 1);
  });

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getBotUsage().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las estadísticas.');
        this.loading.set(false);
      },
    });
  }

  miniPct(value: number, max: number): number {
    return max > 0 ? Math.round((value / max) * 100) : 0;
  }

  funnelPct(value: number) {
    return Math.round((value / this.funnelMax()) * 100);
  }

  timelinePct(value: number) {
    return Math.round((value / this.timelineMax()) * 100);
  }

  formatDate(iso: string) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' });
  }

  instCompletionPct(inst: BotUsageByInstitution) {
    if (!inst.starts) return 0;
    return Math.round((inst.reportCompleted / inst.starts) * 100);
  }

  trackByDate(_: number, item: BotUsageTimeline) {
    return item.date;
  }

  trackByInst(_: number, item: BotUsageByInstitution) {
    return item.institutionId;
  }
}
