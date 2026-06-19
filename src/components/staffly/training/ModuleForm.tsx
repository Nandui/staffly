"use client";

import * as React from "react";
import { useActionState } from "react";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SheetBody, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { useSheetSuccess } from "@/components/staffly/shared/FormSheet";
import type { FormState } from "@/lib/form";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export interface ModuleValues {
  title: string;
  description: string;
  estimatedMinutes: number | null;
  hasAssessment: boolean;
  passMark: number | null;
}

export function ModuleForm({
  action,
  programmeId,
  module,
  submitLabel,
  onSuccess,
}: {
  action: Action;
  programmeId: string;
  module?: ModuleValues;
  submitLabel: string;
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    null,
  );
  useSheetSuccess(state?.ok, "Module saved", onSuccess);
  const fe = state?.fieldErrors ?? {};
  const [assessment, setAssessment] = React.useState(
    module?.hasAssessment ?? false,
  );

  return (
    <form action={formAction} className="flex min-h-0 flex-1 flex-col">
      <input type="hidden" name="programmeId" value={programmeId} />
      <SheetBody className="space-y-4">
        {state?.error && (
          <div className="rounded-lg border border-critical-line bg-critical-bg px-3 py-2 text-sm font-medium text-critical">
            {state.error}
          </div>
        )}
        <Field label="Title" htmlFor="title" required error={fe.title}>
          <Input
            id="title"
            name="title"
            defaultValue={module?.title ?? ""}
            autoFocus
            placeholder="e.g. Fire extinguisher types"
          />
        </Field>
        <Field
          label="Description"
          htmlFor="description"
          error={fe.description}
          hint="What this module covers — the learning content or instructions."
        >
          <Textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={module?.description ?? ""}
          />
        </Field>
        <Field
          label="Estimated duration (minutes)"
          htmlFor="estimatedMinutes"
          error={fe.estimatedMinutes}
          className="max-w-[14rem]"
        >
          <Input
            id="estimatedMinutes"
            name="estimatedMinutes"
            type="number"
            min={1}
            defaultValue={module?.estimatedMinutes ?? ""}
            placeholder="e.g. 30"
          />
        </Field>

        <div className="space-y-3 rounded-lg border border-line p-3">
          <label className="flex items-center gap-2.5 text-sm font-medium text-ink">
            <input
              type="checkbox"
              name="hasAssessment"
              checked={assessment}
              onChange={(e) => setAssessment(e.target.checked)}
              className="size-4 rounded border-line-strong accent-primary"
            />
            This module has an assessment
          </label>
          {assessment && (
            <Field
              label="Pass mark (%)"
              htmlFor="passMark"
              error={fe.passMark}
              className="max-w-[10rem]"
            >
              <Input
                id="passMark"
                name="passMark"
                type="number"
                min={0}
                max={100}
                defaultValue={module?.passMark ?? 80}
              />
            </Field>
          )}
        </div>
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
