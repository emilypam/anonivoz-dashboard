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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Report, Institution, LABELS, ReportStatus, Priority, HarassmentType } from '../../../core/models';

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
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './reports-list.html',
  styleUrl: './reports-list.scss',
})
export class ReportsListComponent implements OnInit {
  reports = signal<Report[]>([]);
  institutions = signal<Institution[]>([]);
  total = signal(0);
  loading = signal(true);
  labels = LABELS;
  isAdmin = false;

  // Búsqueda directa por número
  searchNumber: number | null = null;
  searchNotFound = false;

  // Filters
  filterStatus = '';
  filterPriority = '';
  filterType = '';
  filterInstitutionId = '';
  filterDateFrom = '';
  filterDateTo = '';
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

  dismissing = signal<string | null>(null);
  pendingDismiss = signal<string | null>(null);

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private snack: MatSnackBar,
  ) {}

  ngOnInit() {
    this.isAdmin = this.auth.isAdmin();
    if (this.isAdmin) {
      this.api.getInstitutions().subscribe((list) => this.institutions.set(list));
    }
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
        institutionId: this.isAdmin ? (this.filterInstitutionId || undefined) : undefined,
        dateFrom: this.filterDateFrom || undefined,
        dateTo: this.filterDateTo || undefined,
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
    this.filterInstitutionId = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.page = 0;
    this.load();
  }

  prevPage() {
    if (this.page > 0) { this.page--; this.load(); }
  }

  nextPage() {
    if ((this.page + 1) * PAGE_SIZE < this.total()) { this.page++; this.load(); }
  }

  searchByNumber() {
    if (!this.searchNumber) return;
    this.searchNotFound = false;
    this.api.getReportByNumber(this.searchNumber).subscribe({
      next: (r) => this.router.navigate(['/reports', r.id]),
      error: () => { this.searchNotFound = true; },
    });
  }

  dismiss(id: string, event: Event) {
    event.stopPropagation();
    this.pendingDismiss.set(id);
  }

  confirmDismiss(event: Event) {
    event.stopPropagation();
    const id = this.pendingDismiss();
    if (!id || this.dismissing()) return;
    this.pendingDismiss.set(null);
    this.dismissing.set(id);
    this.api.updateStatus(id, 'DISMISSED').subscribe({
      next: () => {
        this.dismissing.set(null);
        this.snack.open('Reporte desestimado', 'OK', { duration: 2500 });
        this.load();
      },
      error: () => {
        this.dismissing.set(null);
        this.snack.open('Error al desestimar', 'OK', { duration: 2500 });
      },
    });
  }

  cancelDismiss(event: Event) {
    event.stopPropagation();
    this.pendingDismiss.set(null);
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
