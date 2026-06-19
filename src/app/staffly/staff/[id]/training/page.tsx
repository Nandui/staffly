import { GraduationCap } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { TrainingTable } from "@/components/staffly/training/TrainingTable";
import { LogTrainingButton } from "@/components/staffly/staff/TabAddButtons";
import { getCurrentUser, can } from "@/lib/auth";
import { listTrainingForStaff, listActiveProgrammes } from "@/lib/staffly/data/training";

export const metadata = { title: "Training" };

export default async function TrainingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [records, programmes, user] = await Promise.all([
    listTrainingForStaff(id),
    listActiveProgrammes(),
    getCurrentUser(),
  ]);
  const canManage = can(user, "editContent");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-ink">
          Training record
        </h2>
        {canManage && (
          <LogTrainingButton
            staffId={id}
            programmes={programmes.map((p) => ({
              id: p.id,
              name: p.name,
              category: p.category,
              isOneTime: p.isOneTime,
              refreshIntervalMonths: p.refreshIntervalMonths,
            }))}
          />
        )}
      </div>

      {records.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No training recorded"
          description="Log completed training from the library or ad hoc — grouped here by category."
        />
      ) : (
        <TrainingTable
          rows={records.map((r) => ({
            id: r.id,
            title: r.title,
            category: r.category,
            delivery: r.delivery,
            deliveredBy: r.deliveredBy,
            completedDate: r.completedDate,
            durationHours: r.durationHours,
            outcome: r.outcome,
            expiryDate: r.expiryDate,
          }))}
          canManage={canManage}
        />
      )}
    </div>
  );
}
