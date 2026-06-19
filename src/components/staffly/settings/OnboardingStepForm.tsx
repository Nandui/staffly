"use client";

import { useActionState } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SheetBody, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { useSheetSuccess } from "@/components/staffly/shared/FormSheet";
import { ONBOARDING_CATEGORIES } from "@/lib/staffly/constants";
import type { FormState } from "@/lib/form";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export interface StepValues {
  title: string;
  description: string;
  category: string;
  roleId: string | null;
  dueOffsetDays: number | null;
  active: boolean;
}

export function OnboardingStepForm({
  action,
  step,
  roles,
  submitLabel,
  onSuccess,
}: {
  action: Action;
  step?: StepValues;
  roles: { id: string; name: string }[];
  submitLabel: string;
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    null,
  );
  useSheetSuccess(state?.ok, "Step saved", onSuccess);
  const fe = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex min-h-0 flex-1 flex-col">
      <SheetBody className="space-y-4">
        {state?.error && (
          <div className="rounded-lg border border-critical-line bg-critical-bg px-3 py-2 text-sm font-medium text-critical">
            {state.error}
          </div>
        )}
        <Field label="Step" htmlFor="title" required error={fe.title}>
          <Input
            id="title"
            name="title"
            defaultValue={step?.title ?? ""}
            autoFocus
            placeholder="e.g. Sign employment contract"
          />
        </Field>
        <Field label="Description" htmlFor="description" error={fe.description}>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={step?.description ?? ""}
            placeholder="Optional guidance for whoever completes this step."
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Category" htmlFor="category" required error={fe.category}>
            <Select
              id="category"
              name="category"
              defaultValue={step?.category ?? "PAPERWORK"}
            >
              {ONBOARDING_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Applies to"
            htmlFor="roleId"
            error={fe.roleId}
            hint="Limit to one role, or leave for all."
          >
            <Select id="roleId" name="roleId" defaultValue={step?.roleId ?? ""}>
              <option value="">All new starters</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field
          label="Due (days after start)"
          htmlFor="dueOffsetDays"
          error={fe.dueOffsetDays}
          hint="Optional — flags the step overdue this many days after the start date."
          className="max-w-[16rem]"
        >
          <Input
            id="dueOffsetDays"
            name="dueOffsetDays"
            type="number"
            min={0}
            defaultValue={step?.dueOffsetDays ?? ""}
            placeholder="e.g. 7"
          />
        </Field>

        <label className="flex items-center gap-2.5 text-sm text-ink-soft">
          <input
            type="checkbox"
            name="active"
            defaultChecked={step?.active ?? true}
            className="size-4 rounded border-line-strong accent-primary"
          />
          Active
        </label>
      </SheetBody>
      <SheetFooter>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        <SheetClose asChild>
          <Button variant="ghost" type="button">
            Cancel
          </Button>
        </SheetClose>
      </SheetFooter>
    </form>
  );
}
