"use client";

import * as React from "react";
import { useActionState } from "react";
import { differenceInCalendarDays } from "date-fns";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SheetBody, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { useSheetSuccess } from "@/components/staffly/shared/FormSheet";
import { ABSENCE_TYPES } from "@/lib/staffly/constants";
import { addAbsence } from "@/lib/staffly/actions/absence";
import type { FormState } from "@/lib/form";

export function AbsenceForm({
  staffId,
  onSuccess,
}: {
  staffId: string;
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    addAbsence,
    null,
  );
  useSheetSuccess(state?.ok, "Absence logged", onSuccess);
  const fe = state?.fieldErrors ?? {};

  const today = new Date().toISOString().slice(0, 10);
  const [start, setStart] = React.useState(today);
  const [end, setEnd] = React.useState(today);
  const [days, setDays] = React.useState(1);

  React.useEffect(() => {
    if (start && end && !Number.isNaN(Date.parse(start)) && !Number.isNaN(Date.parse(end))) {
      const d = differenceInCalendarDays(new Date(end), new Date(start)) + 1;
      if (d >= 1) setDays(d);
    }
  }, [start, end]);

  return (
    <form action={formAction} className="flex min-h-0 flex-1 flex-col">
      <input type="hidden" name="staffId" value={staffId} />
      <SheetBody className="space-y-4">
        {state?.error && (
          <div className="rounded-lg border border-critical-line bg-critical-bg px-3 py-2 text-sm font-medium text-critical">
            {state.error}
          </div>
        )}
        <Field label="Type" htmlFor="type" required error={fe.type}>
          <Select id="type" name="type" defaultValue="SICK_UNCERTIFIED">
            {ABSENCE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Start date" htmlFor="startDate" required error={fe.startDate}>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </Field>
          <Field label="End date" htmlFor="endDate" required error={fe.endDate}>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </Field>
        </div>
        <Field
          label="Working days"
          htmlFor="daysCount"
          required
          error={fe.daysCount}
          hint="Auto-calculated — adjust if it spans non-working days."
          className="max-w-[10rem]"
        >
          <Input
            id="daysCount"
            name="daysCount"
            type="number"
            min={1}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          />
        </Field>
        <Field label="Reason" htmlFor="reason" error={fe.reason}>
          <Textarea id="reason" name="reason" rows={2} placeholder="Optional context" />
        </Field>
        <Field label="Approved by" htmlFor="approvedBy" required error={fe.approvedBy}>
          <Input id="approvedBy" name="approvedBy" placeholder="Duty manager" />
        </Field>
        <label className="flex items-center gap-2.5 text-sm text-ink-soft">
          <input
            type="checkbox"
            name="certProvided"
            className="size-4 rounded border-line-strong accent-primary"
          />
          Medical certificate provided
        </label>
      </SheetBody>
      <SheetFooter>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Log absence"}
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
