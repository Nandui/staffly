"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Power, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormSheet } from "@/components/staffly/shared/FormSheet";
import { ConfirmDialog } from "@/components/staffly/shared/ConfirmDialog";
import { OnboardingStepForm } from "@/components/staffly/settings/OnboardingStepForm";
import { cn } from "@/lib/utils";
import { ONBOARDING_CATEGORY_LABEL } from "@/lib/staffly/constants";
import {
  createStep,
  updateStep,
  deleteStep,
  setStepActive,
  moveStep,
} from "@/lib/staffly/actions/onboarding";

export interface StepView {
  id: string;
  title: string;
  description: string;
  category: string;
  roleId: string | null;
  roleName: string | null;
  dueOffsetDays: number | null;
  active: boolean;
  completions: number;
}

export function OnboardingStepsManager({
  steps,
  roles,
  canManage,
}: {
  steps: StepView[];
  roles: { id: string; name: string }[];
  canManage: boolean;
}) {
  const [pending, start] = useTransition();

  const move = (id: string, dir: "up" | "down") =>
    start(async () => {
      await moveStep(id, dir);
    });

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Onboarding steps</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            The new-starter journey — shown as a checklist on each staff profile.
          </p>
        </div>
        {canManage && (
          <FormSheet
            title="Add onboarding step"
            description="Add a step to the new-starter journey."
            trigger={
              <Button size="sm">
                <Plus className="size-4" /> Add step
              </Button>
            }
          >
            {({ close }) => (
              <OnboardingStepForm
                action={createStep}
                roles={roles}
                submitLabel="Add step"
                onSuccess={close}
              />
            )}
          </FormSheet>
        )}
      </CardHeader>

      <ul className="divide-y divide-line">
        {steps.length === 0 && (
          <li className="px-5 py-8 text-center text-sm text-muted-foreground">
            No onboarding steps yet.
          </li>
        )}
        {steps.map((s, i) => (
          <li key={s.id} className="flex items-start justify-between gap-3 px-5 py-3.5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-ink">{s.title}</p>
                {!s.active && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.7rem] font-medium text-slate-500">
                    Inactive
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <span className="rounded-full bg-accent px-2 py-0.5 font-medium text-accent-foreground">
                  {ONBOARDING_CATEGORY_LABEL[s.category] ?? s.category}
                </span>
                <span>{s.roleName ?? "All new starters"}</span>
                {s.dueOffsetDays != null && (
                  <span>· Due {s.dueOffsetDays}d after start</span>
                )}
                {s.completions > 0 && <span>· {s.completions} completed</span>}
              </div>
              {s.description && (
                <p className="mt-1 text-xs text-ink-soft">{s.description}</p>
              )}
            </div>
            {canManage && (
              <div className="flex shrink-0 items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Move up"
                  disabled={i === 0 || pending}
                  onClick={() => move(s.id, "up")}
                >
                  <ArrowUp className="size-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Move down"
                  disabled={i === steps.length - 1 || pending}
                  onClick={() => move(s.id, "down")}
                >
                  <ArrowDown className="size-4 text-muted-foreground" />
                </Button>
                <FormSheet
                  title="Edit onboarding step"
                  trigger={
                    <Button variant="ghost" size="icon" aria-label="Edit step">
                      <Pencil className="size-4 text-muted-foreground" />
                    </Button>
                  }
                >
                  {({ close }) => (
                    <OnboardingStepForm
                      action={updateStep.bind(null, s.id)}
                      roles={roles}
                      step={{
                        title: s.title,
                        description: s.description,
                        category: s.category,
                        roleId: s.roleId,
                        dueOffsetDays: s.dueOffsetDays,
                        active: s.active,
                      }}
                      submitLabel="Save changes"
                      onSuccess={close}
                    />
                  )}
                </FormSheet>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={s.active ? "Deactivate" : "Activate"}
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      await setStepActive(s.id, !s.active);
                      toast.success(s.active ? "Step deactivated" : "Step activated");
                    })
                  }
                >
                  <Power
                    className={cn(
                      "size-4",
                      s.active ? "text-cert-valid" : "text-muted-foreground",
                    )}
                  />
                </Button>
                <ConfirmDialog
                  title="Delete this step?"
                  description={`Remove "${s.title}" from the onboarding journey. Completion records for it will also be removed.`}
                  confirmLabel="Delete"
                  successMessage="Step deleted"
                  onConfirm={() => deleteStep(s.id)}
                  trigger={
                    <Button variant="ghost" size="icon" aria-label="Delete step">
                      <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                  }
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
