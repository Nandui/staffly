// Staffly domain enums + display metadata. Client-safe (no server imports), so
// both server components and client components can share labels and badge
// styles. Cert/training states use the Staffly cert tokens; the Bradford risk
// score reuses the shared risk palette (it *is* a risk band).

/* ── Staff status ─────────────────────────────────────────────────────────── */

export const STAFF_STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "PROBATION", label: "Probation" },
  { value: "ON_LEAVE", label: "On leave" },
  { value: "INACTIVE", label: "Inactive" },
] as const;

export type StaffStatus = (typeof STAFF_STATUSES)[number]["value"];

export const STAFF_STATUS_META: Record<
  string,
  { label: string; pill: string; dot: string }
> = {
  ACTIVE: {
    label: "Active",
    pill: "bg-cert-valid-bg text-cert-valid border border-cert-valid-line",
    dot: "bg-cert-valid",
  },
  PROBATION: {
    label: "Probation",
    pill: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    dot: "bg-indigo-500",
  },
  ON_LEAVE: {
    label: "On leave",
    pill: "bg-cert-expiring-bg text-cert-expiring border border-cert-expiring-line",
    dot: "bg-cert-expiring",
  },
  INACTIVE: {
    label: "Inactive",
    pill: "bg-slate-100 text-slate-500 border border-slate-200",
    dot: "bg-slate-400",
  },
};

/* ── Absence ──────────────────────────────────────────────────────────────── */

// Only sickness + unauthorised count toward the Bradford Factor.
export const ABSENCE_TYPES = [
  { value: "SICK_UNCERTIFIED", label: "Sickness (uncertified)", bradford: true },
  { value: "SICK_CERTIFIED", label: "Sickness (certified)", bradford: true },
  { value: "UNAUTHORISED", label: "Unauthorised", bradford: true },
  { value: "ANNUAL_LEAVE", label: "Annual leave", bradford: false },
  { value: "PARENTAL_LEAVE", label: "Parental leave", bradford: false },
  { value: "BEREAVEMENT", label: "Bereavement", bradford: false },
  { value: "OTHER", label: "Other", bradford: false },
] as const;

export type AbsenceType = (typeof ABSENCE_TYPES)[number]["value"];

export const BRADFORD_ABSENCE_TYPES = ABSENCE_TYPES.filter((t) => t.bradford).map(
  (t) => t.value,
) as readonly string[];

export const ABSENCE_TYPE_META: Record<
  string,
  { label: string; pill: string; bradford: boolean }
> = Object.fromEntries(
  ABSENCE_TYPES.map((t) => [
    t.value,
    {
      label: t.label,
      bradford: t.bradford,
      pill: t.bradford
        ? "bg-cert-expiring-bg text-cert-expiring border border-cert-expiring-line"
        : "bg-slate-100 text-slate-600 border border-slate-200",
    },
  ]),
);

/* ── Bradford risk levels (shared risk palette) ───────────────────────────── */

export type BradfordLevel = "low" | "medium" | "high" | "critical";

export const BRADFORD_LEVEL_META: Record<
  BradfordLevel,
  { label: string; text: string; pill: string; bar: string; range: string }
> = {
  low: {
    label: "Low",
    text: "text-low",
    pill: "bg-low-bg text-low border border-low-line",
    bar: "bg-low",
    range: "0–44",
  },
  medium: {
    label: "Medium",
    text: "text-medium",
    pill: "bg-medium-bg text-medium border border-medium-line",
    bar: "bg-medium",
    range: "45–99",
  },
  high: {
    label: "High",
    text: "text-high",
    pill: "bg-high-bg text-high border border-high-line",
    bar: "bg-high",
    range: "100–199",
  },
  critical: {
    label: "Critical",
    text: "text-critical",
    pill: "bg-critical-bg text-critical border border-critical-line",
    bar: "bg-critical",
    range: "200+",
  },
};

/* ── Performance notes ────────────────────────────────────────────────────── */

export const PERF_CATEGORIES = [
  { value: "POSITIVE", label: "Positive" },
  { value: "CONCERN", label: "Concern" },
  { value: "FORMAL", label: "Formal" },
  { value: "OBJECTIVE", label: "Objective" },
  { value: "REVIEW", label: "Review" },
] as const;

export type PerfCategory = (typeof PERF_CATEGORIES)[number]["value"];

// Left-border colour by category (spec §13).
export const PERF_CATEGORY_META: Record<
  string,
  { label: string; border: string; pill: string }
> = {
  POSITIVE: {
    label: "Positive",
    border: "border-l-cert-valid",
    pill: "bg-cert-valid-bg text-cert-valid border border-cert-valid-line",
  },
  CONCERN: {
    label: "Concern",
    border: "border-l-cert-expiring",
    pill: "bg-cert-expiring-bg text-cert-expiring border border-cert-expiring-line",
  },
  FORMAL: {
    label: "Formal",
    border: "border-l-cert-expired",
    pill: "bg-cert-expired-bg text-cert-expired border border-cert-expired-line",
  },
  OBJECTIVE: {
    label: "Objective",
    border: "border-l-primary",
    pill: "bg-accent text-accent-foreground border border-primary/20",
  },
  REVIEW: {
    label: "Review",
    border: "border-l-slate-400",
    pill: "bg-slate-100 text-slate-600 border border-slate-200",
  },
};

export const PERF_VISIBILITIES = [
  { value: "MANAGER_ONLY", label: "Manager only" },
  { value: "SHARED_WITH_STAFF", label: "Shared with staff" },
] as const;

export const PERF_VISIBILITY_LABEL: Record<string, string> = {
  MANAGER_ONLY: "Manager only",
  SHARED_WITH_STAFF: "Shared with staff",
};

/* ── Disciplinary ─────────────────────────────────────────────────────────── */

export const DISCIPLINARY_STAGES = [
  { value: "VERBAL_WARNING", label: "Verbal warning", short: "Verbal" },
  { value: "WRITTEN_WARNING", label: "Written warning", short: "Written" },
  {
    value: "FINAL_WRITTEN_WARNING",
    label: "Final written warning",
    short: "Final written",
  },
  { value: "SUSPENSION", label: "Suspension", short: "Suspension" },
  { value: "DISMISSAL", label: "Dismissal", short: "Dismissal" },
] as const;

export type DisciplinaryStage = (typeof DISCIPLINARY_STAGES)[number]["value"];

export const DISCIPLINARY_STAGE_META: Record<
  string,
  { label: string; short: string; order: number }
> = Object.fromEntries(
  DISCIPLINARY_STAGES.map((s, i) => [
    s.value,
    { label: s.label, short: s.short, order: i },
  ]),
);

export const DISCIPLINARY_STATUSES = [
  { value: "OPEN", label: "Open" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "APPEALED", label: "Appealed" },
] as const;

export const DISCIPLINARY_STATUS_META: Record<
  string,
  { label: string; pill: string; dot: string }
> = {
  OPEN: {
    label: "Open",
    pill: "bg-cert-expiring-bg text-cert-expiring border border-cert-expiring-line",
    dot: "bg-cert-expiring",
  },
  RESOLVED: {
    label: "Resolved",
    pill: "bg-cert-valid-bg text-cert-valid border border-cert-valid-line",
    dot: "bg-cert-valid",
  },
  APPEALED: {
    label: "Appealed",
    pill: "bg-blue-50 text-blue-700 border border-blue-200",
    dot: "bg-blue-500",
  },
};

/* ── Documents ────────────────────────────────────────────────────────────── */

export const DOCUMENT_CATEGORIES = [
  { value: "CONTRACT", label: "Contract" },
  { value: "GARDA_VETTING", label: "Garda vetting" },
  { value: "RIGHT_TO_WORK", label: "Right to work" },
  { value: "CERT", label: "Certification" },
  { value: "DISCIPLINARY", label: "Disciplinary" },
  { value: "TRAINING", label: "Training" },
  { value: "OTHER", label: "Other" },
] as const;

export const DOCUMENT_CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  DOCUMENT_CATEGORIES.map((c) => [c.value, c.label]),
);

export const DOCUMENT_CATEGORY_PILL: Record<string, string> = {
  CONTRACT: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  GARDA_VETTING: "bg-violet-50 text-violet-700 border border-violet-200",
  RIGHT_TO_WORK: "bg-cyan-50 text-cyan-700 border border-cyan-200",
  CERT: "bg-teal-50 text-teal-700 border border-teal-200",
  DISCIPLINARY: "bg-cert-expired-bg text-cert-expired border border-cert-expired-line",
  TRAINING: "bg-blue-50 text-blue-700 border border-blue-200",
  OTHER: "bg-slate-100 text-slate-600 border border-slate-200",
};

/* ── Training ─────────────────────────────────────────────────────────────── */

export const TRAINING_CATEGORIES = [
  { value: "INDUCTION", label: "Induction" },
  { value: "HEALTH_SAFETY", label: "Health & safety" },
  { value: "ROLE_SPECIFIC", label: "Role specific" },
  { value: "LEADERSHIP", label: "Leadership" },
  { value: "COMPLIANCE", label: "Compliance" },
  { value: "CUSTOMER_SERVICE", label: "Customer service" },
  { value: "OTHER", label: "Other" },
] as const;

export type TrainingCategory = (typeof TRAINING_CATEGORIES)[number]["value"];

export const TRAINING_CATEGORY_LABEL: Record<string, string> =
  Object.fromEntries(TRAINING_CATEGORIES.map((c) => [c.value, c.label]));

// Onboarding / new-starter journey -----------------------------------------

export const ONBOARDING_CATEGORIES = [
  { value: "PAPERWORK", label: "Paperwork" },
  { value: "VETTING", label: "Vetting & checks" },
  { value: "TRAINING", label: "Induction training" },
  { value: "ACCESS", label: "Systems & access" },
  { value: "EQUIPMENT", label: "Equipment & uniform" },
  { value: "REVIEW", label: "Reviews & sign-off" },
  { value: "OTHER", label: "Other" },
] as const;

export type OnboardingCategory =
  (typeof ONBOARDING_CATEGORIES)[number]["value"];

export const ONBOARDING_CATEGORY_LABEL: Record<string, string> =
  Object.fromEntries(ONBOARDING_CATEGORIES.map((c) => [c.value, c.label]));

export const TRAINING_DELIVERIES = [
  { value: "IN_PERSON", label: "In person" },
  { value: "ONLINE", label: "Online" },
  { value: "EXTERNAL_COURSE", label: "External course" },
  { value: "SHADOWING", label: "Shadowing" },
  { value: "E_LEARNING", label: "E-learning" },
] as const;

export const TRAINING_DELIVERY_LABEL: Record<string, string> =
  Object.fromEntries(TRAINING_DELIVERIES.map((d) => [d.value, d.label]));

export const TRAINING_OUTCOMES = [
  { value: "PASS", label: "Pass" },
  { value: "FAIL", label: "Fail" },
  { value: "ATTENDED", label: "Attended" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "PENDING", label: "Pending" },
] as const;

export const TRAINING_OUTCOME_META: Record<
  string,
  { label: string; pill: string }
> = {
  PASS: {
    label: "Pass",
    pill: "bg-cert-valid-bg text-cert-valid border border-cert-valid-line",
  },
  FAIL: {
    label: "Fail",
    pill: "bg-cert-expired-bg text-cert-expired border border-cert-expired-line",
  },
  ATTENDED: {
    label: "Attended",
    pill: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  IN_PROGRESS: {
    label: "In progress",
    pill: "bg-cert-expiring-bg text-cert-expiring border border-cert-expiring-line",
  },
  PENDING: {
    label: "Pending",
    pill: "bg-slate-100 text-slate-600 border border-slate-200",
  },
};

/* ── Cert / training compliance status (computed) ─────────────────────────── */

export type CertStatus = "valid" | "expiring" | "expired" | "pending";

export const CERT_STATUS_META: Record<
  CertStatus,
  { label: string; pill: string; dot: string; text: string }
> = {
  valid: {
    label: "Valid",
    text: "text-cert-valid",
    dot: "bg-cert-valid",
    pill: "bg-cert-valid-bg text-cert-valid border border-cert-valid-line",
  },
  expiring: {
    label: "Expiring",
    text: "text-cert-expiring",
    dot: "bg-cert-expiring",
    pill: "bg-cert-expiring-bg text-cert-expiring border border-cert-expiring-line",
  },
  expired: {
    label: "Expired",
    text: "text-cert-expired",
    dot: "bg-cert-expired",
    pill: "bg-cert-expired-bg text-cert-expired border border-cert-expired-line",
  },
  pending: {
    label: "Not held",
    text: "text-cert-pending",
    dot: "bg-cert-pending",
    pill: "bg-cert-pending-bg text-cert-pending border border-slate-200",
  },
};

/* ── Notifications ────────────────────────────────────────────────────────── */

export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export const NOTIFICATION_PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
] as const;

export const NOTIFICATION_PRIORITY_META: Record<
  NotificationPriority,
  { label: string; pill: string; rank: number }
> = {
  LOW: {
    label: "Low",
    rank: 0,
    pill: "bg-slate-100 text-slate-600 border border-slate-200",
  },
  MEDIUM: {
    label: "Medium",
    rank: 1,
    pill: "bg-cert-expiring-bg text-cert-expiring border border-cert-expiring-line",
  },
  HIGH: {
    label: "High",
    rank: 2,
    pill: "bg-high-bg text-high border border-high-line",
  },
  CRITICAL: {
    label: "Critical",
    rank: 3,
    pill: "bg-cert-expired-bg text-cert-expired border border-cert-expired-line",
  },
};

/* ── Thresholds ───────────────────────────────────────────────────────────── */

export const CERT_EXPIRING_SOON_DAYS = 90; // dashboard "certs expiring" window
export const DOC_EXPIRING_SOON_DAYS = 60; // document vault amber window
