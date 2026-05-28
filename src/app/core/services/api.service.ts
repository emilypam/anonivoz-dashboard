import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Report, ReportList, Stats, DeceMember, Institution, ReportStatus, Priority } from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Reportes ──────────────────────────────────────────────────────────────

  getReports(params: {
    limit?: number;
    offset?: number;
    status?: string;
    priority?: string;
    harassmentType?: string;
    assignedToId?: string;
    institutionId?: string;
  }) {
    let p = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) p = p.set(k, String(v));
    });
    return this.http.get<ReportList>(`${this.base}/api/reports`, { params: p });
  }

  getReport(id: string) {
    return this.http.get<Report>(`${this.base}/api/reports/${id}`);
  }

  getStats() {
    return this.http.get<Stats>(`${this.base}/api/reports/stats`);
  }

  updateStatus(id: string, status: ReportStatus, notes?: string) {
    return this.http.patch<Report>(`${this.base}/api/reports/${id}/status`, { status, notes });
  }

  updatePriority(id: string, priority: Priority) {
    return this.http.patch<Report>(`${this.base}/api/reports/${id}/priority`, { priority });
  }

  assignTo(id: string, assignedToId: string | null) {
    return this.http.patch<Report>(`${this.base}/api/reports/${id}/assign`, { assignedToId });
  }

  addNote(id: string, content: string) {
    return this.http.post(`${this.base}/api/reports/${id}/notes`, { content });
  }

  // ── Miembros DECE ─────────────────────────────────────────────────────────

  getMembers(institutionId?: string) {
    let p = new HttpParams();
    if (institutionId) p = p.set('institutionId', institutionId);
    return this.http.get<DeceMember[]>(`${this.base}/dece/members`, { params: p });
  }

  createMember(data: { name: string; email: string; password: string; role: string; institutionId?: string }) {
    return this.http.post<DeceMember>(`${this.base}/dece/members`, data);
  }

  updateMember(id: string, data: Partial<Pick<DeceMember, 'name' | 'email' | 'role' | 'active' | 'institutionId'>>) {
    return this.http.patch<DeceMember>(`${this.base}/dece/members/${id}`, data);
  }

  updateMemberPassword(id: string, password: string) {
    return this.http.patch(`${this.base}/dece/members/${id}/password`, { password });
  }

  // ── Instituciones ─────────────────────────────────────────────────────────

  getInstitutions() {
    return this.http.get<Institution[]>(`${this.base}/institutions`);
  }

  getInstitution(id: string) {
    return this.http.get<Institution>(`${this.base}/institutions/${id}`);
  }

  createInstitution(data: { name: string; city?: string; code?: string }) {
    return this.http.post<Institution>(`${this.base}/institutions`, data);
  }

  updateInstitution(id: string, data: { name?: string; city?: string; code?: string; active?: boolean }) {
    return this.http.patch<Institution>(`${this.base}/institutions/${id}`, data);
  }

  // ── Auth bootstrap ────────────────────────────────────────────────────────

  bootstrapAdmin(data: { name: string; email: string; password: string; key: string }) {
    return this.http.post(`${this.base}/auth/admin/bootstrap`, data);
  }

  bootstrapDece(data: { name: string; email: string; password: string; key: string }) {
    return this.http.post(`${this.base}/auth/bootstrap`, data);
  }
}
