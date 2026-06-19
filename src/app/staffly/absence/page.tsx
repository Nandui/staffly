import { CalendarOff, ClipboardCheck, CalendarDays, Ban } from "lucide-react";
import { PageHeader } from "@/components/staffly/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { AbsenceTable } from "@/components/staffly/absence/AbsenceTable";
import { ExcelExportButton } from "@/components/staffly/shared/ExportButtons";
import { getCenterContext } from "@/lib/center-context";
import { getCurrentUser, can } from "@/lib/auth";
import { getAbsenceStats, listAllAbsences } from "@/lib/staffly/data/absence";
import { ABSENCE_TYPE_META } from "@/lib/staffly/constants";
import { cn, formatDate } from "@/lib/utils";

export const metadata = { title: "Absence overview" };

function StatCard({
  icon: Icon,
  label,
  value,
  tone = "text-ink",
}: {
  icon: typeof CalendarOff;
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon className="size-4 text-faint" />
      </div>
      <p className={cn("mt-2 font-display text-3xl font-semibold tnum", tone)}>
        {value}
      </p>
    </Card>
  );
}

export default async function AbsenceOverviewPage() {
  const { selected, selectedId } = await getCenterContext();
  const [stats, absences, user] = await Promise.all([
    getAbsenceStats(selectedId),
    listAllAbsences(selectedId),
    getCurrentUser(),
  ]);
  const canManage = can(user, "editContent");

  const rows = absences.map((a) => ({
    id: a.id,
    type: a.type,
    startDate: a.startDate,
    endDate: a.endDate,
    daysCount: a.daysCount,
    reason: a.reason,
    certProvided: a.certProvided,
    approvedBy: a.approvedBy,
    returnToWorkCompletedAt: a.returnToWorkCompletedAt,
    staffId: a.staff.id,
    staffName: `${a.staff.firstName} ${a.staff.lastName}`,
    centerName: a.staff.center.name,
  }));

  const excelRows = rows.map((r) => ({
    Staff: r.staffName,
    Centre: r.centerName,
    Type: ABSENCE_TYPE_META[r.type]?.label ?? r.type,
    Start: formatDate(r.startDate),
    End: formatDate(r.endDate),
    Days: r.daysCount,
    "Cert provided": r.certProvided ? "Yes" : "No",
    "Approved by": r.approvedBy,
    RTW: r.returnToWorkCompletedAt ? "Complete" : "Pending",
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={selected ? selected.name : "All centres"}
        title="Absence overview"
        description="Every absence across your centres, with return-to-work status."
        actions={
          <ExcelExportButton
            filename="staffly-absence.xlsx"
            sheetName="Absence"
            rows={excelRows}
          />
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CalendarOff} label="Absences this month" value={stats.thisMonth} />
        <StatCard
          icon={CalendarDays}
          label="Days lost this month"
          value={stats.daysThisMonth}
        />
        <StatCard
          icon={ClipboardCheck}
          label="RTW pending"
          value={stats.pendingRtw}
          tone={stats.pendingRtw > 0 ? "text-cert-expiring" : "text-ink"}
        />
        <StatCard
          icon={Ban}
          label="Unauthorised (all time)"
          value={stats.unauthorised}
          tone={stats.unauthorised > 0 ? "text-cert-expired" : "text-ink"}
        />
      </div>

      <AbsenceTable rows={rows} showStaff canManage={canManage} />
    </div>
  );
}
