import { startOfMonth } from "date-fns";
import { db } from "@/lib/db";
import { centerScope } from "@/lib/center-context";
import { calculateBradfordFactor } from "@/lib/staffly/bradford";

export async function listAbsencesForStaff(staffId: string) {
  return db.absenceRecord.findMany({
    where: { staffId },
    orderBy: { startDate: "desc" },
  });
}

export async function getBradfordForStaff(staffId: string) {
  const absences = await db.absenceRecord.findMany({
    where: { staffId },
    select: { type: true, startDate: true, endDate: true, daysCount: true },
  });
  return calculateBradfordFactor(absences);
}

export async function listAllAbsences(selectedId: string | null) {
  const rows = await db.absenceRecord.findMany({
    where: { staff: { ...centerScope(selectedId) } },
    orderBy: { startDate: "desc" },
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
  });
  return rows;
}

export type AbsenceWithStaff = Awaited<
  ReturnType<typeof listAllAbsences>
>[number];

export async function getAbsenceStats(selectedId: string | null) {
  const monthStart = startOfMonth(new Date());
  const scope = centerScope(selectedId);

  const [thisMonth, pendingRtw, totalDaysThisMonth, unauthorised] =
    await Promise.all([
      db.absenceRecord.count({
        where: { staff: scope, startDate: { gte: monthStart } },
      }),
      db.absenceRecord.count({
        where: {
          staff: scope,
          type: { in: ["SICK_UNCERTIFIED", "SICK_CERTIFIED"] },
          returnToWorkCompletedAt: null,
        },
      }),
      db.absenceRecord.aggregate({
        where: { staff: scope, startDate: { gte: monthStart } },
        _sum: { daysCount: true },
      }),
      db.absenceRecord.count({
        where: { staff: scope, type: "UNAUTHORISED" },
      }),
    ]);

  return {
    thisMonth,
    pendingRtw,
    daysThisMonth: totalDaysThisMonth._sum.daysCount ?? 0,
    unauthorised,
  };
}
