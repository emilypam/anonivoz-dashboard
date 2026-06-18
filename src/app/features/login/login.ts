import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');
  showPassword = signal(false);
  showSetupPassword = signal(false);

  // First-admin setup
  setupMode = signal(false);
  setupName = '';
  setupEmail = '';
  setupPassword = '';
  setupKey = '';
  setupError = signal('');
  setupSuccess = signal('');
  setupLoading = signal(false);

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private router: Router,
  ) {
    if (auth.isLoggedIn()) router.navigate(['/dashboard']);
  }

  login() {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error.set(err.error?.message ?? 'Error al iniciar sesión');
        this.loading.set(false);
      },
    });
  }

  setupAdmin() {
    if (!this.setupName || !this.setupEmail || !this.setupPassword || !this.setupKey) return;
    this.setupLoading.set(true);
    this.setupError.set('');
    this.api
      .bootstrapAdmin({
        name: this.setupName,
        email: this.setupEmail,
        password: this.setupPassword,
        key: this.setupKey,
      })
      .subscribe({
        next: () => {
          this.setupSuccess.set('Cuenta creada. Inicia sesión con tu correo y contraseña.');
          this.setupLoading.set(false);
          this.setupMode.set(false);
          this.email = this.setupEmail;
        },
        error: (err) => {
          this.setupError.set(err.error?.message ?? 'Error al crear la cuenta');
          this.setupLoading.set(false);
        },
      });
  }
}
