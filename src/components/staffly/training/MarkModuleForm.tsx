"use client";

import * as React from "react";
import { useActionState } from "react";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SheetBody, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { useSheetSuccess } from "@/components/staffly/shared/FormSheet";
import { markModuleComplete } from "@/lib/staffly/actions/training-modules";
import { toDateInputValue } from "@/lib/utils";
import type { FormState } from "@/lib/form";

export interface CompletionValues {
  completedDate: Date | string;
  score: number | null;
  passed: boolean;
  notes: string;
}

export function MarkModuleForm({
  moduleId,
  staffId,
  hasAssessment,
  passMark,
  completion,
  onSuccess,
}: {
  moduleId: string;
  staffId: string;
  hasAssessment: boolean;
  passMark: number | null;
  completion?: CompletionValues;
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    markModuleComplete,
    null,
  );
  useSheetSuccess(state?.ok, "Module recorded", onSuccess);
  const fe = state?.fieldErrors ?? {};

  const defaultDate = completion
    ? toDateInputValue(new Date(completion.completedDate))
    : toDateInputValue(new Date());
  const [score, setScore] = React.useState(
    completion?.score != null ? String(completion.score) : "",
  );

  // Suggested pass/fail from the score when there's a pass mark.
  const scoreNum = score === "" ? null : Number(score);
  const autoPassed =
    passMark != null && scoreNum != null ? scoreNum >= passMark : true;
  const defaultPassed = completion?.passed ?? autoPassed;

  return (
    <form action={formAction} className="flex min-h-0 flex-1 flex-col">
      <input type="hidden" name="moduleId" value={moduleId} />
      <input type="hidden" name="staffId" value={staffId} />
      <SheetBody className="space-y-4">
        {state?.error && (
          <div className="rounded-lg border border-critical-line bg-critical-bg px-3 py-2 text-sm font-medium text-critical">
            {state.error}
          </div>
        )}

        <Field
          label="Completed on"
          htmlFor="completedDate"
          required
          error={fe.completedDate}
          className="max-w-[14rem]"
        >
          <Input
            id="completedDate"
            name="completedDate"
            type="date"
            defaultValue={defaultDate}
          />
        </Field>

        {hasAssessment ? (
          <>
            <Field
              label={passMark != null ? `Score (% — ${passMark}% to pass)` : "Score (%)"}
              htmlFor="score"
              error={fe.score}
              className="max-w-[14rem]"
            >
              <Input
                id="score"
                name="score"
                type="number"
                min={0}
                max={100}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="e.g. 90"
              />
            </Field>
            <label className="flex items-center gap-2.5 text-sm text-ink-soft">
              <input
                type="checkbox"
                name="passed"
                defaultChecked={defaultPassed}
                key={String(defaultPassed)}
                className="size-4 rounded border-line-strong accent-primary"
              />
              Passed
            </label>
          </>
        ) : (
          <input type="hidden" name="passed" value="true" />
        )}

        <Field label="Notes" htmlFor="notes" error={fe.notes}>
          <Textarea id="notes" name="notes" rows={2} defaultValue={completion?.notes ?? ""} />
        </Field>
      </SheetBody>
      <SheetFooter>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : completion ? "Update" : "Mark complete"}
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
