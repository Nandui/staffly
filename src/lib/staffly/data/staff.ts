import { startOfYear } from "date-fns";
import { db } from "@/lib/db";
import { centerScope } from "@/lib/center-context";
import { calculateBradfordFactor } from "@/lib/staffly/bradford";
import { rollupCertHealth, type CertHealth } from "@/lib/staffly/utils";

export interface StaffRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photo: string | null;
  status: string;
  startDate: Date;
  endDate: Date | null;
  roleId: string | null;
  roleName: string | null;
  centerId: string;
  centerName: string;
  absencesYtd: number;
  bradfordScore: number;
  bradfordLevel: "low" | "medium" | "high" | "critical";
  certHealth: CertHealth;
}

export async function listStaffWithMetrics(
  selectedId: string | null,
): Promise<StaffRow[]> {
  const staff = await db.staffMember.findMany({
    where: { ...centerScope(selectedId) },
    orderBy: [{ status: "asc" }, { lastName: "asc" }, { firstName: "asc" }],
    include: {
      role: { select: { id: true, name: true } },
      center: { select: { id: true, name: true } },
      absences: {
        select: { type: true, startDate: true, endDate: true, daysCount: true },
      },
      certifications: { select: { expiryDate: true } },
    },
  });

  const yearStart = startOfYear(new Date());

  return staff.map((s) => {
    const bradford = calculateBradfordFactor(s.absences);
    const absencesYtd = s.absences
      .filter((a) => new Date(a.startDate) >= yearStart)
      .reduce((n, a) => n + a.daysCount, 0);
    return {
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      phone: s.phone,
      photo: s.photo,
      status: s.status,
      startDate: s.startDate,
      endDate: s.endDate,
      roleId: s.roleId,
      roleName: s.role?.name ?? null,
      centerId: s.centerId,
      centerName: s.center.name,
      absencesYtd,
      bradfordScore: bradford.score,
      bradfordLevel: bradford.riskLevel,
      certHealth: rollupCertHealth(s.certifications),
    };
  });
}

export async function getStaffProfile(id: string) {
  return db.staffMember.findUnique({
    where: { id },
    include: {
      center: { select: { id: true, name: true } },
      role: {
        include: {
          requiredCertTypes: { select: { id: true, name: true } },
          trainingProgrammes: { select: { id: true, name: true } },
        },
      },
    },
  });
}

export type StaffProfile = NonNullable<
  Awaited<ReturnType<typeof getStaffProfile>>
>;

// Lightweight overview metrics for a single staff member (Overview tab cards).
export async function getStaffOverview(id: string) {
  const [absences, certs, training, openDisciplinary, perfFlags] =
    await Promise.all([
      db.absenceRecord.findMany({
        where: { staffId: id },
        select: {
          type: true,
          startDate: true,
          endDate: true,
          daysCount: true,
          returnToWorkCompletedAt: true,
        },
      }),
      db.certRecord.findMany({
        where: { staffId: id },
        select: { expiryDate: true },
      }),
      db.trainingRecord.findMany({
        where: { staffId: id },
        select: { outcome: true, expiryDate: true },
      }),
      db.disciplinaryRecord.count({ where: { staffId: id, status: "OPEN" } }),
      db.performanceNote.count({ where: { staffId: id, category: "CONCERN" } }),
    ]);

  const bradford = calculateBradfordFactor(absences);
  const yearStart = startOfYear(new Date());
  const absencesYtd = absences
    .filter((a) => new Date(a.startDate) >= yearStart)
    .reduce((n, a) => n + a.daysCount, 0);
  const pendingRtw = absences.filter(
    (a) =>
      (a.type === "SICK_UNCERTIFIED" || a.type === "SICK_CERTIFIED") &&
      !a.returnToWorkCompletedAt,
  ).length;

  return {
    bradford,
    absencesYtd,
    pendingRtw,
    certHealth: rollupCertHealth(certs),
    trainingTotal: training.length,
    trainingComplete: training.filter((t) => t.outcome === "PASS").length,
    openDisciplinary,
    concerns: perfFlags,
  };
}
