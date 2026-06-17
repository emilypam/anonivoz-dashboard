export type InformantType = 'VICTIM' | 'WITNESS';
export type HarassmentType = 'PHYSICAL' | 'VERBAL' | 'SOCIAL' | 'CYBERBULLYING';
export type FrequencyLevel = 'ONCE' | 'WEEKLY' | 'DAILY';
export type LocationTag = 'CLASSROOM' | 'RECESS' | 'SOCIAL_MEDIA' | 'OUTSIDE';
export type IncidentDateApprox =
  | 'TODAY'
  | 'YESTERDAY'
  | 'THIS_WEEK'
  | 'LAST_WEEK'
  | 'OVER_A_MONTH';
export type ReportStatus = 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type DeceRole = 'COUNSELOR' | 'COORDINATOR' | 'DIRECTOR';

export interface Institution {
  id: string;
  name: string;
  code: string;
  city?: string | null;
  active: boolean;
  createdAt: string;
  _count?: { members: number; reports: number };
}

export interface DeceMember {
  id: string;
  name: string;
  email: string;
  role: DeceRole;
  active: boolean;
  institutionId: string | null;
  institution?: { id: string; name: string; code: string } | null;
  createdAt: string;
  _count?: { assignedReports: number };
}

export interface Incident {
  harassmentType: HarassmentType;
  frequencyLevel: FrequencyLevel;
  locationTag: LocationTag;
  incidentDateApprox: IncidentDateApprox;
  description: string;
}

export interface CaseNote {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string };
}

export interface StatusChange {
  id: string;
  oldStatus: ReportStatus | null;
  newStatus: ReportStatus;
  notes: string | null;
  changedAt: string;
  changedBy: { name: string } | null;
}

export interface Report {
  id: string;
  reportNumber: number;
  telegramUserId: string;
  institutionId: string | null;
  institution?: { id: string; name: string; code: string } | null;
  informantType: InformantType;
  wantsContact: boolean;
  previousReport: boolean;
  status: ReportStatus;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  assignedTo?: DeceMember | null;
  incident?: Incident | null;
  aggressors?: { id: string; description: string }[];
  witnesses?: { id: string; description: string }[];
  evidence?: { id: string; url: string }[];
  notes?: CaseNote[];
  statusHistory?: StatusChange[];
  _count?: { notes: number };
}

export interface ReportList {
  total: number;
  data: Report[];
}

export interface Stats {
  total: number;
  last7Days: number;
  byStatus: Record<ReportStatus, number>;
  byPriority: Record<Priority, number>;
  byHarassmentType: Record<HarassmentType, number>;
  pending: number;
  urgent: number;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: DeceRole | 'ADMIN';
  institutionId: string | null;
  isAdmin: boolean;
}

export interface AuthResponse {
  access_token: string;
  user: CurrentUser;
}

export interface BotUsageTimeline {
  date: string;
  starts: number;
  reportStarts: number;
  reportCompleted: number;
}

export interface BotUsageByInstitution {
  institutionId: string;
  name: string;
  starts: number;
  reportCompleted: number;
  reportAbandoned: number;
}

export interface BotUsageStats {
  totalUniqueUsers: number;
  usersLast7Days: number;
  usersLast30Days: number;
  totalStarts: number;
  totalReportStarts: number;
  totalReportCompleted: number;
  totalReportAbandoned: number;
  totalSupportSessions: number;
  completionRate: number;
  abandonRate: number;
  timeline: BotUsageTimeline[];
  byInstitution: BotUsageByInstitution[];
}

export interface LoginLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  userType: 'dece' | 'admin';
  institutionId: string | null;
  institutionName: string | null;
  createdAt: string;
}

export const LABELS = {
  status: {
    PENDING: 'Pendiente',
    IN_REVIEW: 'En revisión',
    RESOLVED: 'Resuelto',
    DISMISSED: 'Desestimado',
  },
  priority: {
    LOW: 'Baja',
    MEDIUM: 'Media',
    HIGH: 'Alta',
    URGENT: 'Urgente',
  },
  harassment: {
    PHYSICAL: 'Físico',
    VERBAL: 'Verbal',
    SOCIAL: 'Social',
    CYBERBULLYING: 'Ciberacoso',
  },
  frequency: {
    ONCE: 'Una vez',
    WEEKLY: 'Semanal',
    DAILY: 'Diario',
  },
  location: {
    CLASSROOM: 'Salón de clases',
    RECESS: 'Recreo',
    SOCIAL_MEDIA: 'Redes sociales',
    OUTSIDE: 'Fuera de la escuela',
  },
  date: {
    TODAY: 'Hoy',
    YESTERDAY: 'Ayer',
    THIS_WEEK: 'Esta semana',
    LAST_WEEK: 'Semana pasada',
    OVER_A_MONTH: 'Hace más de un mes',
  },
  informant: {
    VICTIM: 'Víctima',
    WITNESS: 'Testigo',
  },
  role: {
    COUNSELOR: 'Consejero/a',
    COORDINATOR: 'Coordinador/a',
    DIRECTOR: 'Director/a',
  },
};
