import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import {
  Report,
  DeceMember,
  LABELS,
  ReportStatus,
  Priority,
} from '../../../core/models';

type Tab = 'info' | 'notes' | 'history';

@Component({
  selector: 'app-report-detail',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './report-detail.html',
  styleUrl: './report-detail.scss',
})
export class ReportDetailComponent implements OnInit {
  report = signal<Report | null>(null);
  members = signal<DeceMember[]>([]);
  loading = signal(true);
  saving = signal(false);
  activeTab = signal<Tab>('info');
  labels = LABELS;

  // Edit state
  selectedStatus = '';
  selectedPriority = '';
  selectedAssignee = '';
  statusNote = '';
  newNote = '';
  savingNote = signal(false);
  contactMessage = '';
  sendingContact = signal(false);

  readonly statuses: { value: ReportStatus; label: string }[] = [
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'IN_REVIEW', label: 'En revisión' },
    { value: 'RESOLVED', label: 'Resuelto' },
    { value: 'DISMISSED', label: 'Desestimado' },
  ];

  readonly priorities: { value: Priority; label: string }[] = [
    { value: 'LOW', label: 'Baja' },
    { value: 'MEDIUM', label: 'Media' },
    { value: 'HIGH', label: 'Alta' },
    { value: 'URGENT', label: 'Urgente' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private snack: MatSnackBar,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getReport(id).subscribe((r) => {
      this.report.set(r);
      this.selectedStatus = r.status;
      this.selectedPriority = r.priority;
      this.selectedAssignee = r.assignedTo?.id ?? '';
      this.loading.set(false);
    });
    this.api.getMembers().subscribe((m) => this.members.set(m));
  }

  goBack() { this.router.navigate(['/reports']); }

  saveStatus() {
    const r = this.report();
    if (!r || this.saving()) return;
    this.saving.set(true);
    this.api.updateStatus(r.id, this.selectedStatus as ReportStatus, this.statusNote || undefined)
      .subscribe({
        next: (updated) => {
          this.report.set(updated as Report);
          this.statusNote = '';
          this.saving.set(false);
          this.snack.open('Estado actualizado', 'OK', { duration: 2500 });
          // Reload to get updated history
          this.reload();
        },
        error: () => { this.saving.set(false); },
      });
  }

  savePriority() {
    const r = this.report();
    if (!r || this.saving()) return;
    this.saving.set(true);
    this.api.updatePriority(r.id, this.selectedPriority as Priority).subscribe({
      next: (updated) => {
        this.report.set(updated as Report);
        this.saving.set(false);
        this.snack.open('Prioridad actualizada', 'OK', { duration: 2500 });
      },
      error: () => { this.saving.set(false); },
    });
  }

  saveAssignee() {
    const r = this.report();
    if (!r || this.saving()) return;
    this.saving.set(true);
    this.api.assignTo(r.id, this.selectedAssignee || null).subscribe({
      next: (updated) => {
        this.report.set(updated as Report);
        this.saving.set(false);
        this.snack.open('Asignación actualizada', 'OK', { duration: 2500 });
      },
      error: () => { this.saving.set(false); },
    });
  }

  addNote() {
    const r = this.report();
    if (!r || !this.newNote.trim() || this.savingNote()) return;
    this.savingNote.set(true);
    this.api.addNote(r.id, this.newNote.trim()).subscribe({
      next: () => {
        this.newNote = '';
        this.savingNote.set(false);
        this.snack.open('Nota agregada', 'OK', { duration: 2500 });
        this.reload();
      },
      error: () => { this.savingNote.set(false); },
    });
  }

  sendContact() {
    const r = this.report();
    if (!r || !this.contactMessage.trim() || this.sendingContact()) return;
    this.sendingContact.set(true);
    this.api.sendMessageToInformant(r.id, this.contactMessage.trim()).subscribe({
      next: () => {
        this.contactMessage = '';
        this.sendingContact.set(false);
        this.snack.open('Mensaje enviado por Telegram', 'OK', { duration: 3000 });
      },
      error: () => {
        this.sendingContact.set(false);
        this.snack.open('Error al enviar el mensaje', 'OK', { duration: 3000 });
      },
    });
  }

  private reload() {
    const id = this.report()?.id;
    if (!id) return;
    this.api.getReport(id).subscribe((r) => this.report.set(r));
  }

  formatDate(d: string) {
    return new Date(d).toLocaleDateString('es-EC', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  formatShortDate(d: string) {
    return new Date(d).toLocaleDateString('es-EC', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  statusLabel(s: string) { return this.labels.status[s as keyof typeof this.labels.status] ?? s; }
  priorityLabel(p: string) { return this.labels.priority[p as keyof typeof this.labels.priority] ?? p; }
  harassmentLabel(h: string) { return this.labels.harassment[h as keyof typeof this.labels.harassment] ?? h; }
  frequencyLabel(f: string) { return this.labels.frequency[f as keyof typeof this.labels.frequency] ?? f; }
  locationLabel(l: string) { return this.labels.location[l as keyof typeof this.labels.location] ?? l; }
  dateLabel(d: string) { return this.labels.date[d as keyof typeof this.labels.date] ?? d; }
  informantLabel(i: string) { return this.labels.informant[i as keyof typeof this.labels.informant] ?? i; }
}
