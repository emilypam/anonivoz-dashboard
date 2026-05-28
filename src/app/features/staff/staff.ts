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
import { DeceMember, LABELS, DeceRole } from '../../core/models';

interface NewMemberForm {
  name: string;
  email: string;
  password: string;
  role: DeceRole;
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
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  labels = LABELS;

  form: NewMemberForm = { name: '', email: '', password: '', role: 'COUNSELOR' };
  formError = signal('');

  editingId = signal<string | null>(null);
  editRole = '';
  editActive = true;
  savingEdit = signal(false);

  readonly roles: { value: DeceRole; label: string }[] = [
    { value: 'COUNSELOR', label: 'Consejero/a' },
    { value: 'COORDINATOR', label: 'Coordinador/a' },
    { value: 'DIRECTOR', label: 'Director/a' },
  ];

  constructor(
    private api: ApiService,
    private snack: MatSnackBar,
  ) {}

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.loading.set(true);
    this.api.getMembers().subscribe((m) => {
      this.members.set(m);
      this.loading.set(false);
    });
  }

  createMember() {
    if (!this.form.name || !this.form.email || !this.form.password) return;
    this.saving.set(true);
    this.formError.set('');
    this.api.createMember(this.form).subscribe({
      next: () => {
        this.snack.open('Miembro agregado correctamente', 'OK', { duration: 3000 });
        this.form = { name: '', email: '', password: '', role: 'COUNSELOR' };
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
    this.editRole = m.role;
    this.editActive = m.active;
  }

  saveEdit(id: string) {
    this.savingEdit.set(true);
    this.api.updateMember(id, { role: this.editRole as DeceRole, active: this.editActive })
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
}
