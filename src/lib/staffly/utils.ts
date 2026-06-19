import { addMonths, differenceInCalendarDays } from "date-fns";
import {
  CERT_EXPIRING_SOON_DAYS,
  type CertStatus,
} from "@/lib/staffly/constants";

export function staffName(s: {
  firstName: string;
  lastName: string;
}): string {
  return `${s.firstName} ${s.lastName}`.trim();
}

export function staffInitials(s: {
  firstName?: string | null;
  lastName?: string | null;
}): string {
  const a = (s.firstName ?? "").trim()[0] ?? "";
  const b = (s.lastName ?? "").trim()[0] ?? "";
  return (a + b).toUpperCase() || "?";
}

// Whole calendar days until `date` (negative = in the past).
export function daysUntil(
  date: Date | string | null | undefined,
  ref: Date = new Date(),
): number {
  if (!date) return Infinity;
  return differenceInCalendarDays(new Date(date), ref);
}

// Compliance status for a cert/training record with an expiry date.
export function certStatusFromExpiry(
  expiry: Date | string | null | undefined,
  ref: Date = new Date(),
  expiringDays: number = CERT_EXPIRING_SOON_DAYS,
): CertStatus {
  if (!expiry) return "valid"; // no expiry = does not lapse
  const days = daysUntil(expiry, ref);
  if (days < 0) return "expired";
  if (days <= expiringDays) return "expiring";
  return "valid";
}

// "expires in 12 days" / "expired 3 days ago" / "expires today".
export function expiryCountdownLabel(
  days: number,
  { verb = "expires" }: { verb?: string } = {},
): string {
  if (!Number.isFinite(days)) return "No expiry";
  if (days === 0) return `${verb} today`;
  if (days > 0) return `${verb} in ${days} day${days === 1 ? "" : "s"}`;
  const ago = Math.abs(days);
  const past = verb === "expires" ? "expired" : verb;
  return `${past} ${ago} day${ago === 1 ? "" : "s"} ago`;
}

export function computeExpiryDate(issueDate: Date, validityMonths: number): Date {
  return addMonths(issueDate, validityMonths);
}

// Mini cert-health summary used on the staff directory + overview cards.
export interface CertHealth {
  total: number;
  valid: number;
  expiring: number;
  expired: number;
}

export function rollupCertHealth(
  records: { expiryDate: Date | string }[],
  ref: Date = new Date(),
): CertHealth {
  const health: CertHealth = {
    total: records.length,
    valid: 0,
    expiring: 0,
    expired: 0,
  };
  for (const r of records) {
    const s = certStatusFromExpiry(r.expiryDate, ref);
    if (s === "expired") health.expired += 1;
    else if (s === "expiring") health.expiring += 1;
    else health.valid += 1;
  }
  return health;
}
