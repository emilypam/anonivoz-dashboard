import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { DeceMember, Institution, LABELS, DeceRole } from '../../core/models';

interface NewMemberForm {
  name: string;
  email: string;
  password: string;
  role: DeceRole;
  institutionId: string;
}

@Component({
  selector: 'app-staff',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSlideToggleModule,
  ],
  templateUrl: './staff.html',
  styleUrl: './staff.scss',
})
export class StaffComponent implements OnInit {
  members = signal<DeceMember[]>([]);
  institutions = signal<Institution[]>([]);
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  labels = LABELS;
  isAdmin = false;

  form: NewMemberForm = { name: '', email: '', password: '', role: 'COUNSELOR', institutionId: '' };
  formError = signal('');

  editingId = signal<string | null>(null);
  editName = '';
  editRole = '';
  editActive = true;
  savingEdit = signal(false);

  filterInstitutionId = '';

  readonly roles: { value: DeceRole; label: string }[] = [
    { value: 'COUNSELOR', label: 'Consejero/a' },
    { value: 'COORDINATOR', label: 'Coordinador/a' },
    { value: 'DIRECTOR', label: 'Director/a' },
  ];

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private snack: MatSnackBar,
  ) {}

  ngOnInit() {
    this.isAdmin = this.auth.isAdmin();
    if (this.isAdmin) {
      this.api.getInstitutions().subscribe((list) => this.institutions.set(list));
    }
    this.loadMembers();
  }

  loadMembers() {
    this.loading.set(true);
    const instId = this.isAdmin ? (this.filterInstitutionId || undefined) : undefined;
    this.api.getMembers(instId).subscribe((m) => {
      this.members.set(m);
      this.loading.set(false);
    });
  }

  createMember() {
    if (!this.form.name || !this.form.email || !this.form.password) return;
    this.saving.set(true);
    this.formError.set('');
    const payload = this.isAdmin
      ? this.form
      : { ...this.form, institutionId: undefined };
    this.api.createMember(payload).subscribe({
      next: () => {
        this.snack.open('Miembro agregado correctamente', 'OK', { duration: 3000 });
        this.form = { name: '', email: '', password: '', role: 'COUNSELOR', institutionId: '' };
        this.showForm.set(false);
        this.saving.set(false);
        this.loadMembers();
      },
      error: (err) => {
        this.formError.set(err.error?.message ?? 'Error al crear el miembro');
        this.saving.set(false);
      },
    });
  }

  startEdit(m: DeceMember) {
    this.editingId.set(m.id);
    this.editName = m.name;
    this.editRole = m.role;
    this.editActive = m.active;
  }

  saveEdit(id: string) {
    this.savingEdit.set(true);
    const payload: any = { role: this.editRole as DeceRole, active: this.editActive };
    if (this.isAdmin) payload.name = this.editName;
    this.api.updateMember(id, payload)
      .subscribe({
        next: () => {
          this.editingId.set(null);
          this.savingEdit.set(false);
          this.snack.open('Miembro actualizado', 'OK', { duration: 2500 });
          this.loadMembers();
        },
        error: () => { this.savingEdit.set(false); },
      });
  }

  cancelEdit() {
    this.editingId.set(null);
  }

  roleLabel(r: string) {
    return this.labels.role[r as keyof typeof this.labels.role] ?? r;
  }

  formatDate(d: string) {
    return new Date(d).toLocaleDateString('es-EC', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  institutionName(id: string | null): string {
    if (!id) return '—';
    return this.institutions().find((i) => i.id === id)?.name ?? '—';
  }
}
