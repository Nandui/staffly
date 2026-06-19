"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, Circle, AlertTriangle } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { ONBOARDING_CATEGORIES, ONBOARDING_CATEGORY_LABEL } from "@/lib/staffly/constants";
import {
  markOnboardingStep,
  clearOnboardingStep,
} from "@/lib/staffly/actions/onboarding";

export interface OnboardingItemView {
  id: string;
  title: string;
  description: string;
  category: string;
  dueDate: Date | string | null;
  overdue: boolean;
  completion: {
    completedDate: Date | string;
    completedBy: string;
    notes: string;
  } | null;
}

export function StaffOnboarding({
  staffId,
  items,
  done,
  total,
  canManage,
}: {
  staffId: string;
  items: OnboardingItemView[];
  done: number;
  total: number;
  canManage: boolean;
}) {
  const [pending, start] = useTransition();
  const pct = total ? Math.round((done / total) * 100) : 0;
  const complete = total > 0 && done === total;

  const toggle = (item: OnboardingItemView) =>
    start(async () => {
      if (item.completion) {
        await clearOnboardingStep(item.id, staffId);
        toast.success("Marked not done");
      } else {
        await markOnboardingStep(item.id, staffId);
        toast.success("Step completed");
      }
    });

  const groups = ONBOARDING_CATEGORIES.map((c) => ({
    value: c.value,
    label: c.label,
    items: items.filter((i) => i.category === c.value),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-5">
      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-ink">Onboarding progress</p>
            <p className="text-xs text-muted-foreground">
              {complete ? "All steps complete" : `${total - done} step${total - done === 1 ? "" : "s"} remaining`}
            </p>
          </div>
          <span
            className={cn(
              "font-mono text-lg font-semibold tnum",
              complete ? "text-cert-valid" : "text-ink",
            )}
          >
            {done}/{total}
          </span>
        </div>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              complete ? "bg-cert-valid" : "bg-primary",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {groups.map((g) => (
        <section key={g.value} className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {ONBOARDING_CATEGORY_LABEL[g.value] ?? g.label}
          </h3>
          <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
            {g.items.map((item) => {
              const c = item.completion;
              return (
                <li key={item.id} className="flex items-start gap-3 px-4 py-3">
                  <button
                    type="button"
                    disabled={!canManage || pending}
                    onClick={() => toggle(item)}
                    aria-label={c ? "Mark not done" : "Mark done"}
                    className={cn(
                      "mt-0.5 shrink-0 rounded-full transition-colors",
                      canManage && "hover:opacity-80",
                      !canManage && "cursor-default",
                    )}
                  >
                    {c ? (
                      <CheckCircle2 className="size-5 text-cert-valid" />
                    ) : (
                      <Circle
                        className={cn(
                          "size-5",
                          item.overdue ? "text-cert-expired" : "text-faint",
                        )}
                      />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        c ? "text-muted-foreground line-through" : "text-ink",
                      )}
                    >
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="mt-0.5 text-xs text-ink-soft">{item.description}</p>
                    )}
                    <div className="mt-1 text-xs">
                      {c ? (
                        <span className="text-muted-foreground">
                          Completed {formatDate(c.completedDate)}
                          {c.completedBy && ` · ${c.completedBy}`}
                        </span>
                      ) : item.dueDate ? (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1",
                            item.overdue
                              ? "font-medium text-cert-expired"
                              : "text-muted-foreground",
                          )}
                        >
                          {item.overdue && <AlertTriangle className="size-3" />}
                          Due {formatDate(item.dueDate)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
