import Link from "next/link";
import { ClipboardList, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/staffly/layout/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { getCenterContext } from "@/lib/center-context";
import { getOnboardingOverview } from "@/lib/staffly/data/onboarding";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Onboarding" };

export default async function OnboardingPage() {
  const { selected, selectedId } = await getCenterContext();
  const rows = await getOnboardingOverview(selectedId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={selected ? selected.name : "All centres"}
        title="Onboarding"
        description="New starters still working through their induction journey."
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No one in onboarding"
          description="Everyone with onboarding steps is fully set up. New starters appear here until their journey is complete."
        />
      ) : (
        <Card>
          <ul className="divide-y divide-line">
            {rows.map((r) => {
              const pct = r.total ? Math.round((r.done / r.total) * 100) : 0;
              return (
                <li key={r.id}>
                  <Link
                    href={`/staff/${r.id}/onboarding`}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface-2/60"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-ink">{r.name}</p>
                        {r.overdue > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-cert-expired-bg px-2 py-0.5 text-[0.7rem] font-medium text-cert-expired">
                            <AlertTriangle className="size-3" /> {r.overdue} overdue
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {r.roleName ?? "No role"} · {r.centerName} · started{" "}
                        {formatDate(r.startDate)}
                      </p>
                    </div>
                    <div className="hidden w-40 shrink-0 sm:block">
                      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-12 shrink-0 text-right font-mono text-sm tnum text-muted-foreground">
                      {r.done}/{r.total}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
