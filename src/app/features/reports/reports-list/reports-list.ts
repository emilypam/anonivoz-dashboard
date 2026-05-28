import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { Report, LABELS, ReportStatus, Priority, HarassmentType } from '../../../core/models';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-reports-list',
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './reports-list.html',
  styleUrl: './reports-list.scss',
})
export class ReportsListComponent implements OnInit {
  reports = signal<Report[]>([]);
  total = signal(0);
  loading = signal(true);
  labels = LABELS;

  // Filters
  filterStatus = '';
  filterPriority = '';
  filterType = '';
  page = 0;

  readonly statuses: { value: ReportStatus | ''; label: string }[] = [
    { value: '', label: 'Todos los estados' },
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'IN_REVIEW', label: 'En revisión' },
    { value: 'RESOLVED', label: 'Resuelto' },
    { value: 'DISMISSED', label: 'Desestimado' },
  ];

  readonly priorities: { value: Priority | ''; label: string }[] = [
    { value: '', label: 'Todas las prioridades' },
    { value: 'LOW', label: 'Baja' },
    { value: 'MEDIUM', label: 'Media' },
    { value: 'HIGH', label: 'Alta' },
    { value: 'URGENT', label: 'Urgente' },
  ];

  readonly harassmentTypes: { value: HarassmentType | ''; label: string }[] = [
    { value: '', label: 'Todos los tipos' },
    { value: 'PHYSICAL', label: 'Físico' },
    { value: 'VERBAL', label: 'Verbal' },
    { value: 'SOCIAL', label: 'Social' },
    { value: 'CYBERBULLYING', label: 'Ciberacoso' },
  ];

  constructor(
    private api: ApiService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api
      .getReports({
        limit: PAGE_SIZE,
        offset: this.page * PAGE_SIZE,
        status: this.filterStatus || undefined,
        priority: this.filterPriority || undefined,
        harassmentType: this.filterType || undefined,
      })
      .subscribe((res) => {
        this.reports.set(res.data);
        this.total.set(res.total);
        this.loading.set(false);
      });
  }

  applyFilters() {
    this.page = 0;
    this.load();
  }

  clearFilters() {
    this.filterStatus = '';
    this.filterPriority = '';
    this.filterType = '';
    this.page = 0;
    this.load();
  }

  prevPage() {
    if (this.page > 0) { this.page--; this.load(); }
  }

  nextPage() {
    if ((this.page + 1) * PAGE_SIZE < this.total()) { this.page++; this.load(); }
  }

  openReport(id: string) {
    this.router.navigate(['/reports', id]);
  }

  get totalPages() { return Math.ceil(this.total() / PAGE_SIZE); }

  formatDate(d: string) {
    return new Date(d).toLocaleDateString('es-EC', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  statusLabel(s: string) { return this.labels.status[s as keyof typeof this.labels.status] ?? s; }
  priorityLabel(p: string) { return this.labels.priority[p as keyof typeof this.labels.priority] ?? p; }
  harassmentLabel(h: string) { return this.labels.harassment[h as keyof typeof this.labels.harassment] ?? h; }
  informantLabel(i: string) { return this.labels.informant[i as keyof typeof this.labels.informant] ?? i; }
}
