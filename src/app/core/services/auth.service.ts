import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, CurrentUser } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'anonivoz_token';
  private readonly USER_KEY  = 'anonivoz_user';

  currentUser = signal<CurrentUser | null>(this.loadUser());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(this.TOKEN_KEY, res.access_token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
          this.currentUser.set(res.user);
        }),
      );
  }

  /** Borra token y usuario de memoria sin navegar (uso interno). */
  clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
  }

  /** Cierra sesión y redirige a login. reason: 'expired' | 'inactivity' */
  logout(reason?: string) {
    this.clearSession();
    const extras = reason ? { queryParams: { reason } } : undefined;
    this.router.navigate(['/login'], extras);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /** Verifica si el token JWT ya venció leyendo su campo `exp`. */
  isTokenExpired(token?: string): boolean {
    const t = token ?? this.getToken();
    if (!t) return true;
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  isAdmin(): boolean {
    return this.currentUser()?.isAdmin ?? false;
  }

  private loadUser(): CurrentUser | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
