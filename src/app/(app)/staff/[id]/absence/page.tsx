import { BradfordScoreCard } from "@/components/staffly/absence/BradfordScoreCard";
import { AbsenceTable } from "@/components/staffly/absence/AbsenceTable";
import { AddAbsenceButton } from "@/components/staffly/staff/TabAddButtons";
import { getCurrentUser, can } from "@/lib/auth";
import { getBradfordForStaff, listAbsencesForStaff } from "@/lib/staffly/data/absence";

export const metadata = { title: "Absence" };

export default async function AbsencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [bradford, absences, user] = await Promise.all([
    getBradfordForStaff(id),
    listAbsencesForStaff(id),
    getCurrentUser(),
  ]);
  const canManage = can(user, "editContent");

  return (
    <div className="space-y-4">
      <BradfordScoreCard result={bradford} />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-semibold text-ink">Absence history</h2>
          {absences.length > 0 && (
            <span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-xs font-semibold tnum text-muted-foreground">
              {absences.length}
            </span>
          )}
        </div>
        {canManage && <AddAbsenceButton staffId={id} />}
      </div>

      <AbsenceTable
        rows={absences.map((a) => ({
          id: a.id,
          type: a.type,
          startDate: a.startDate,
          endDate: a.endDate,
          daysCount: a.daysCount,
          reason: a.reason,
          certProvided: a.certProvided,
          approvedBy: a.approvedBy,
          returnToWorkCompletedAt: a.returnToWorkCompletedAt,
        }))}
        canManage={canManage}
      />
    </div>
  );
}
