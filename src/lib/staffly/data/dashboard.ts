import { addDays, startOfMonth, subMonths, format } from "date-fns";
import { db } from "@/lib/db";
import { centerScope } from "@/lib/center-context";
import { certStatusFromExpiry, staffName } from "@/lib/staffly/utils";
import { ABSENCE_TYPE_META } from "@/lib/staffly/constants";

export interface DashboardData {
  activeStaff: number;
  totalStaff: number;
  absencesThisMonth: number;
  certsExpiring: number;
  certsExpired: number;
  actionsOutstanding: number;
  openDisciplinary: number;
  pendingRtw: number;
  certHealth: { valid: number; expiring: number; expired: number };
  absenceTrend: { month: string; days: number }[];
  absentToday: {
    staffId: string;
    name: string;
    centerName: string;
    type: string;
    until: Date;
  }[];
  recent: {
    id: string;
    kind: string;
    title: string;
    detail: string;
    date: Date;
  }[];
}

export async function getDashboard(
  selectedId: string | null,
): Promise<DashboardData> {
  const scope = centerScope(selectedId);
  const today = new Date();
  const monthStart = startOfMonth(today);
  const in90 = addDays(today, 90);

  const [
    activeStaff,
    totalStaff,
    absencesThisMonth,
    certRows,
    openDisciplinary,
    pendingRtw,
    absentTodayRows,
  ] = await Promise.all([
    db.staffMember.count({ where: { ...scope, status: { not: "INACTIVE" } } }),
    db.staffMember.count({ where: { ...scope } }),
    db.absenceRecord.count({
      where: { staff: scope, startDate: { gte: monthStart } },
    }),
    db.certRecord.findMany({
      where: { staff: scope },
      select: { expiryDate: true },
    }),
    db.disciplinaryRecord.count({ where: { staff: scope, status: "OPEN" } }),
    db.absenceRecord.count({
      where: {
        staff: scope,
        type: { in: ["SICK_UNCERTIFIED", "SICK_CERTIFIED"] },
        returnToWorkCompletedAt: null,
      },
    }),
    db.absenceRecord.findMany({
      where: {
        staff: scope,
        startDate: { lte: today },
        endDate: { gte: today },
      },
      orderBy: { endDate: "asc" },
      include: {
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            center: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  const certHealth = { valid: 0, expiring: 0, expired: 0 };
  for (const c of certRows) {
    const s = certStatusFromExpiry(c.expiryDate, today);
    if (s === "expired") certHealth.expired += 1;
    else if (s === "expiring") certHealth.expiring += 1;
    else certHealth.valid += 1;
  }
  const certsExpiring = certHealth.expiring + certHealth.expired;

  // Absence trend — total days per month over the last 6 months.
  const trendStart = startOfMonth(subMonths(today, 5));
  const trendAbsences = await db.absenceRecord.findMany({
    where: { staff: scope, startDate: { gte: trendStart } },
    select: { startDate: true, daysCount: true },
  });
  const buckets = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    buckets.set(format(subMonths(today, i), "MMM"), 0);
  }
  for (const a of trendAbsences) {
    const k = format(new Date(a.startDate), "MMM");
    if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + a.daysCount);
  }
  const absenceTrend = [...buckets].map(([month, days]) => ({ month, days }));

  // Recent activity — newest mutations across the Staffly entities.
  const recent = await getRecentActivity(selectedId);

  return {
    activeStaff,
    totalStaff,
    absencesThisMonth,
    certsExpiring,
    certsExpired: certHealth.expired,
    actionsOutstanding: openDisciplinary + pendingRtw,
    openDisciplinary,
    pendingRtw,
    certHealth,
    absenceTrend,
    absentToday: absentTodayRows.map((a) => ({
      staffId: a.staff.id,
      name: staffName(a.staff),
      centerName: a.staff.center.name,
      type: ABSENCE_TYPE_META[a.type]?.label ?? a.type,
      until: a.endDate,
    })),
    recent,
  };
}

async function getRecentActivity(selectedId: string | null) {
  const scope = centerScope(selectedId);
  const staffScope = { staff: scope };

  const [staff, absences, certs, training] = await Promise.all([
    db.staffMember.findMany({
      where: scope,
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, firstName: true, lastName: true, createdAt: true },
    }),
    db.absenceRecord.findMany({
      where: staffScope,
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { staff: { select: { firstName: true, lastName: true } } },
    }),
    db.certRecord.findMany({
      where: staffScope,
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        staff: { select: { firstName: true, lastName: true } },
        certType: { select: { name: true } },
      },
    }),
    db.trainingRecord.findMany({
      where: staffScope,
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { staff: { select: { firstName: true, lastName: true } } },
    }),
  ]);

  const items = [
    ...staff.map((s) => ({
      id: `staff-${s.id}`,
      kind: "staff",
      title: `${s.firstName} ${s.lastName} added`,
      detail: "New staff member",
      date: s.createdAt,
    })),
    ...absences.map((a) => ({
      id: `absence-${a.id}`,
      kind: "absence",
      title: `Absence logged — ${a.staff.firstName} ${a.staff.lastName}`,
      detail: ABSENCE_TYPE_META[a.type]?.label ?? a.type,
      date: a.createdAt,
    })),
    ...certs.map((c) => ({
      id: `cert-${c.id}`,
      kind: "cert",
      title: `${c.certType.name} recorded`,
      detail: `${c.staff.firstName} ${c.staff.lastName}`,
      date: c.createdAt,
    })),
    ...training.map((t) => ({
      id: `training-${t.id}`,
      kind: "training",
      title: `Training logged — ${t.title}`,
      detail: `${t.staff.firstName} ${t.staff.lastName}`,
      date: t.createdAt,
    })),
  ];

  return items
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 10);
}
