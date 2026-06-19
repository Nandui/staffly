"use client";

import { useActionState } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SheetBody, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { useSheetSuccess } from "@/components/staffly/shared/FormSheet";
import { PERF_CATEGORIES, PERF_VISIBILITIES } from "@/lib/staffly/constants";
import { addPerformanceNote } from "@/lib/staffly/actions/performance";
import type { FormState } from "@/lib/form";

export function PerformanceNoteForm({
  staffId,
  onSuccess,
}: {
  staffId: string;
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    addPerformanceNote,
    null,
  );
  useSheetSuccess(state?.ok, "Note added", onSuccess);
  const fe = state?.fieldErrors ?? {};
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="flex min-h-0 flex-1 flex-col">
      <input type="hidden" name="staffId" value={staffId} />
      <SheetBody className="space-y-4">
        {state?.error && (
          <div className="rounded-lg border border-critical-line bg-critical-bg px-3 py-2 text-sm font-medium text-critical">
            {state.error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category" htmlFor="category" required error={fe.category}>
            <Select id="category" name="category" defaultValue="POSITIVE">
              {PERF_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Date" htmlFor="noteDate" required error={fe.noteDate}>
            <Input id="noteDate" name="noteDate" type="date" defaultValue={today} />
          </Field>
        </div>
        <Field label="Title" htmlFor="title" required error={fe.title}>
          <Input id="title" name="title" placeholder="Short summary" />
        </Field>
        <Field label="Detail" htmlFor="body" required error={fe.body}>
          <Textarea id="body" name="body" rows={5} />
        </Field>
        <Field
          label="Visibility"
          htmlFor="visibility"
          required
          error={fe.visibility}
        >
          <Select id="visibility" name="visibility" defaultValue="MANAGER_ONLY">
            {PERF_VISIBILITIES.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </Select>
        </Field>
      </SheetBody>
      <SheetFooter>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Add note"}
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
