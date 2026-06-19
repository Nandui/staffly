import { differenceInCalendarDays } from "date-fns";
import type { NotificationPriority } from "@/lib/staffly/constants";

export interface CertRecordForNotify {
  id: string;
  staffId: string;
  staffName: string;
  certType: string;
  centerName: string;
  expiryDate: Date;
  roleRequired: boolean;
  roleName?: string | null;
}

export interface StafflyNotification {
  id: string; // `${certRecordId}:${priority}`
  certRecordId: string;
  staffId: string;
  staffName: string;
  certType: string;
  centerName: string;
  priority: NotificationPriority;
  message: string;
  days: number; // days until expiry (negative = overdue)
  roleRequired: boolean;
  expiryDate: Date;
  acknowledged: boolean;
  acknowledgedAt: Date | null;
}

const PRIORITY_RANK: Record<NotificationPriority, number> = {
  CRITICAL: 3,
  HIGH: 2,
  MEDIUM: 1,
  LOW: 0,
};

// Maps days-until-expiry to a priority bucket; null = too far out to alert.
export function priorityForDays(days: number): NotificationPriority | null {
  if (days < 0) return "CRITICAL";
  if (days <= 30) return "HIGH";
  if (days <= 60) return "MEDIUM";
  if (days <= 90) return "LOW";
  return null;
}

function messageFor(
  r: CertRecordForNotify,
  priority: NotificationPriority,
  days: number,
): string {
  const inDays = days === 0 ? "today" : `in ${days} day${days === 1 ? "" : "s"}`;
  switch (priority) {
    case "CRITICAL":
      if (r.roleRequired) {
        return `⚠ Expired — ${r.staffName}'s ${r.certType} is required for the ${
          r.roleName ?? "assigned"
        } role.`;
      }
      return `${r.staffName}'s ${r.certType} has expired.`;
    case "HIGH":
      return `Urgent — ${r.staffName}'s ${r.certType} expires ${inDays}.`;
    case "MEDIUM":
      return `Book renewal now — ${r.staffName}'s ${r.certType} expires ${inDays}.`;
    case "LOW":
    default:
      return `${r.staffName}'s ${r.certType} expires ${inDays}.`;
  }
}

export function buildNotifications(
  records: CertRecordForNotify[],
  acks: Map<string, Date>, // key `${certRecordId}:${priority}` -> acknowledgedAt
  ref: Date = new Date(),
): StafflyNotification[] {
  const out: StafflyNotification[] = [];
  for (const r of records) {
    const days = differenceInCalendarDays(new Date(r.expiryDate), ref);
    const priority = priorityForDays(days);
    if (!priority) continue;
    const key = `${r.id}:${priority}`;
    const ackAt = acks.get(key) ?? null;
    out.push({
      id: key,
      certRecordId: r.id,
      staffId: r.staffId,
      staffName: r.staffName,
      certType: r.certType,
      centerName: r.centerName,
      priority,
      message: messageFor(r, priority, days),
      days,
      roleRequired: r.roleRequired,
      expiryDate: new Date(r.expiryDate),
      acknowledged: ackAt != null,
      acknowledgedAt: ackAt,
    });
  }
  // Highest priority first, then soonest to expire.
  return out.sort(
    (a, b) =>
      PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] || a.days - b.days,
  );
}

export function isUnacknowledgedMediumPlus(n: StafflyNotification): boolean {
  return !n.acknowledged && PRIORITY_RANK[n.priority] >= PRIORITY_RANK.MEDIUM;
}
