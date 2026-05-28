import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ApiService } from '../../core/services/api.service';
import { Institution } from '../../core/models';

interface InstitutionForm {
  name: string;
  city: string;
  code: string;
}

@Component({
  selector: 'app-institutions',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSlideToggleModule,
  ],
  templateUrl: './institutions.html',
  styleUrl: './institutions.scss',
})
export class InstitutionsComponent implements OnInit {
  institutions = signal<Institution[]>([]);
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  formError = signal('');

  editingId = signal<string | null>(null);
  editName = '';
  editCity = '';
  editActive = true;
  savingEdit = signal(false);

  qrInstitution = signal<Institution | null>(null);

  form: InstitutionForm = { name: '', city: '', code: '' };

  constructor(
    private api: ApiService,
    private snack: MatSnackBar,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getInstitutions().subscribe((list) => {
      this.institutions.set(list);
      this.loading.set(false);
    });
  }

  create() {
    if (!this.form.name.trim()) return;
    this.saving.set(true);
    this.formError.set('');
    this.api
      .createInstitution({
        name: this.form.name.trim(),
        city: this.form.city.trim() || undefined,
        code: this.form.code.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.snack.open('Institución creada correctamente', 'OK', { duration: 3000 });
          this.form = { name: '', city: '', code: '' };
          this.showForm.set(false);
          this.saving.set(false);
          this.load();
        },
        error: (err) => {
          this.formError.set(err.error?.message ?? 'Error al crear la institución');
          this.saving.set(false);
        },
      });
  }

  startEdit(inst: Institution) {
    this.editingId.set(inst.id);
    this.editName = inst.name;
    this.editCity = inst.city ?? '';
    this.editActive = inst.active;
    this.qrInstitution.set(null);
  }

  saveEdit(id: string) {
    this.savingEdit.set(true);
    this.api
      .updateInstitution(id, {
        name: this.editName.trim(),
        city: this.editCity.trim() || undefined,
        active: this.editActive,
      })
      .subscribe({
        next: () => {
          this.editingId.set(null);
          this.savingEdit.set(false);
          this.snack.open('Institución actualizada', 'OK', { duration: 2500 });
          this.load();
        },
        error: () => {
          this.savingEdit.set(false);
        },
      });
  }

  cancelEdit() {
    this.editingId.set(null);
  }

  showQr(inst: Institution) {
    this.qrInstitution.set(this.qrInstitution()?.id === inst.id ? null : inst);
    this.editingId.set(null);
  }

  qrUrl(code: string): string {
    const botUsername = 'AnoniVozBot';
    const deepLink = `https://t.me/${botUsername}?start=${code}`;
    const encoded = encodeURIComponent(deepLink);
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encoded}`;
  }

  deepLink(code: string): string {
    return `https://t.me/AnoniVozBot?start=${code}`;
  }

  copyLink(code: string) {
    navigator.clipboard.writeText(this.deepLink(code));
    this.snack.open('Enlace copiado al portapapeles', '', { duration: 2000 });
  }

  formatDate(d: string) {
    return new Date(d).toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
