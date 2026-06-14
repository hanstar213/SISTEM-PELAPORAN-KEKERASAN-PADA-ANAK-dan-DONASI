import {
  type ReportCategory,
  type UrgencyLevel,
  type ReportStatus,
  type DonationType,
  type PaymentStatus,
  type Role,
  type NotificationType,
} from "@prisma/client";

// ─── User Types ─────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: Role;
  phone: string | null;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image: string;
  role: Role;
}

// ─── Report Types ───────────────────────────────────────────

export interface CreateReportInput {
  title: string;
  description: string;
  category: ReportCategory;
  isAnonymous: boolean;
  evidence: string[];
  location?: string;
  latitude?: number;
  longitude?: number;
  incidentDate?: string;
}

export interface ReportWithReporter {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  urgencyLevel: UrgencyLevel;
  status: ReportStatus;
  isAnonymous: boolean;
  evidence: string[];
  location: string | null;
  incidentDate: Date | null;
  adminNotes?: string | null;
  timeline?: unknown;
  reporter: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Donation Types ─────────────────────────────────────────

export interface CreateDonationInput {
  amount: number;
  type: DonationType;
  donorName?: string;
  donorEmail?: string;
  isAnonymous: boolean;
  message?: string;
  programId?: string;
  goodsDescription?: string;
  goodsType?: string;
  estimatedValue?: number;
  pickupSchedule?: string;
  pickupAddress?: string;
}

export interface DonationWithProgram {
  id: string;
  amount: number;
  type: DonationType;
  paymentStatus: PaymentStatus;
  donorName: string | null;
  isAnonymous: boolean;
  message: string | null;
  goodsDescription: string | null;
  goodsType: string | null;
  estimatedValue: number | null;
  pickupSchedule: Date | null;
  pickupAddress: string | null;
  program: {
    id: string;
    title: string;
  } | null;
  createdAt: Date;
}

// ─── Program Types ──────────────────────────────────────────

export interface ProgramSummary {
  id: string;
  title: string;
  description: string;
  coverImage: string | null;
  targetAmount: number;
  currentAmount: number;
  isActive: boolean;
  donationCount: number;
  endDate: Date | null;
}

// ─── Notification Types ─────────────────────────────────────

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link: string | null;
  createdAt: Date;
}

// ─── Dashboard / Stats ─────────────────────────────────────

export interface DashboardStats {
  totalReports: number;
  totalDonations: number;
  totalDonationAmount: number;
  activePrograms: number;
  reportsByCategory: Record<ReportCategory, number>;
  reportsByStatus: Record<ReportStatus, number>;
  recentReports: ReportWithReporter[];
  recentDonations: DonationWithProgram[];
}

// ─── API Response ───────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
