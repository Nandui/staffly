"use client";

import { useActionState } from "react";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SheetBody, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { useSheetSuccess } from "@/components/staffly/shared/FormSheet";
import { completeRtw } from "@/lib/staffly/actions/absence";
import type { FormState } from "@/lib/form";

export function RtwForm({
  absenceId,
  onSuccess,
}: {
  absenceId: string;
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    completeRtw,
    null,
  );
  useSheetSuccess(state?.ok, "Return-to-work recorded", onSuccess);
  const fe = state?.fieldErrors ?? {};
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="flex min-h-0 flex-1 flex-col">
      <input type="hidden" name="absenceId" value={absenceId} />
      <SheetBody className="space-y-4">
        {state?.error && (
          <div className="rounded-lg border border-critical-line bg-critical-bg px-3 py-2 text-sm font-medium text-critical">
            {state.error}
          </div>
        )}
        <Field label="Interview date" htmlFor="rtwDate" required error={fe.rtwDate}>
          <Input id="rtwDate" name="rtwDate" type="date" defaultValue={today} />
        </Field>
        <Field
          label="Conducted by"
          htmlFor="conductedBy"
          required
          error={fe.conductedBy}
        >
          <Input id="conductedBy" name="conductedBy" placeholder="Manager name" />
        </Field>
        <Field
          label="Staff account"
          htmlFor="account"
          error={fe.account}
          hint="The staff member's account of the absence."
        >
          <Textarea id="account" name="account" rows={3} />
        </Field>
        <Field label="Further action" htmlFor="furtherAction" error={fe.furtherAction}>
          <Textarea
            id="furtherAction"
            name="furtherAction"
            rows={2}
            placeholder="Any follow-up, referrals or adjustments"
          />
        </Field>
      </SheetBody>
      <SheetFooter>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Complete RTW"}
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
