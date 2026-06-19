"use client";

import * as React from "react";
import { useActionState } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SheetBody, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { TRAINING_CATEGORIES } from "@/lib/staffly/constants";
import type { FormState } from "@/lib/form";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export interface ProgrammeValues {
  name: string;
  description: string;
  category: string;
  requiredForRoleIds: string[];
  isOneTime: boolean;
  refreshIntervalMonths: number | null;
  active: boolean;
}

export function ProgrammeForm({
  action,
  roles,
  programme,
  submitLabel,
}: {
  action: Action;
  roles: { id: string; name: string }[];
  programme?: ProgrammeValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    null,
  );
  const fe = state?.fieldErrors ?? {};
  const [oneTime, setOneTime] = React.useState(programme?.isOneTime ?? true);
  const required = new Set(programme?.requiredForRoleIds ?? []);

  return (
    <form action={formAction} className="flex min-h-0 flex-1 flex-col">
      <SheetBody className="space-y-4">
        {state?.error && (
          <div className="rounded-lg border border-critical-line bg-critical-bg px-3 py-2 text-sm font-medium text-critical">
            {state.error}
          </div>
        )}
        <Field label="Name" htmlFor="name" required error={fe.name}>
          <Input id="name" name="name" defaultValue={programme?.name ?? ""} autoFocus />
        </Field>
        <Field label="Description" htmlFor="description" error={fe.description}>
          <Textarea
            id="description"
            name="description"
            rows={2}
            defaultValue={programme?.description ?? ""}
          />
        </Field>
        <Field label="Category" htmlFor="category" required error={fe.category}>
          <Select
            id="category"
            name="category"
            defaultValue={programme?.category ?? "INDUCTION"}
          >
            {TRAINING_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Required for roles" error={fe.requiredForRoleIds}>
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-line p-3">
            {roles.length === 0 && (
              <p className="col-span-2 text-xs text-muted-foreground">
                No roles yet — add roles in Settings.
              </p>
            )}
            {roles.map((r) => (
              <label
                key={r.id}
                className="flex items-center gap-2 text-sm text-ink-soft"
              >
                <input
                  type="checkbox"
                  name="requiredForRoleIds"
                  value={r.id}
                  defaultChecked={required.has(r.id)}
                  className="size-4 rounded border-line-strong accent-primary"
                />
                {r.name}
              </label>
            ))}
          </div>
        </Field>

        <Field label="Frequency" error={fe.refreshIntervalMonths}>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="radio"
                name="isOneTime"
                value="true"
                checked={oneTime}
                onChange={() => setOneTime(true)}
                className="size-4 accent-primary"
              />
              One-time
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="radio"
                name="isOneTime"
                value="false"
                checked={!oneTime}
                onChange={() => setOneTime(false)}
                className="size-4 accent-primary"
              />
              Recurring
            </label>
          </div>
        </Field>

        {!oneTime && (
          <Field
            label="Refresh interval (months)"
            htmlFor="refreshIntervalMonths"
            error={fe.refreshIntervalMonths}
            className="max-w-[12rem]"
          >
            <Input
              id="refreshIntervalMonths"
              name="refreshIntervalMonths"
              type="number"
              min={1}
              defaultValue={programme?.refreshIntervalMonths ?? 12}
            />
          </Field>
        )}

        <label className="flex items-center gap-2.5 text-sm text-ink-soft">
          <input
            type="checkbox"
            name="active"
            defaultChecked={programme?.active ?? true}
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
