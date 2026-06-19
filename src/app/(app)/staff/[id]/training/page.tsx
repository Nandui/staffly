import { GraduationCap } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { TrainingTable } from "@/components/staffly/training/TrainingTable";
import { StaffProgrammeProgress } from "@/components/staffly/training/StaffProgrammeProgress";
import { LogTrainingButton } from "@/components/staffly/staff/TabAddButtons";
import { getCurrentUser, can } from "@/lib/auth";
import {
  listTrainingForStaff,
  listActiveProgrammesForLogging,
  getStaffProgrammeProgress,
} from "@/lib/staffly/data/training";

export const metadata = { title: "Training" };

export default async function TrainingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [records, programmes, progress, user] = await Promise.all([
    listTrainingForStaff(id),
    listActiveProgrammesForLogging(id),
    getStaffProgrammeProgress(id),
    getCurrentUser(),
  ]);
  const canManage = can(user, "editContent");

  const progressViews = progress.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    category: p.category,
    required: p.required,
    total: p.total,
    done: p.done,
    modules: p.modules.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      estimatedMinutes: m.estimatedMinutes,
      hasAssessment: m.hasAssessment,
      passMark: m.passMark,
      resources: m.resources.map((r) => ({
        id: r.id,
        kind: r.kind as "LINK" | "FILE",
        label: r.label,
        url: r.url,
      })),
      completion: m.completion
        ? {
            completedDate: m.completion.completedDate,
            score: m.completion.score,
            passed: m.completion.passed,
            notes: m.completion.notes,
          }
        : null,
    })),
  }));

  return (
    <div className="space-y-6">
      {progressViews.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold text-ink">Programme progress</h2>
            <span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-xs font-semibold tnum text-muted-foreground">
              {progressViews.length}
            </span>
          </div>
          <StaffProgrammeProgress
            staffId={id}
            programmes={progressViews}
            canManage={canManage}
          />
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold text-ink">Training record</h2>
            {records.length > 0 && (
              <span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-xs font-semibold tnum text-muted-foreground">
                {records.length}
              </span>
            )}
          </div>
          {canManage && (
            <LogTrainingButton staffId={id} programmes={programmes} />
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
      </section>
    </div>
  );
}
