"use client";

import * as React from "react";
import { useActionState } from "react";
import Link from "next/link";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Button, buttonClasses } from "@/components/ui/button";
import {
  DISCIPLINARY_STAGES,
  DISCIPLINARY_STATUSES,
} from "@/lib/staffly/constants";
import { createDisciplinary } from "@/lib/staffly/actions/disciplinary";
import type { FormState } from "@/lib/form";

export function DisciplinaryForm({
  staffId,
  cancelHref,
}: {
  staffId: string;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createDisciplinary,
    null,
  );
  const fe = state?.fieldErrors ?? {};
  const [witness, setWitness] = React.useState(false);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="max-w-[680px] space-y-4">
      <input type="hidden" name="staffId" value={staffId} />
      {state?.error && (
        <div className="rounded-lg border border-critical-line bg-critical-bg px-4 py-3 text-sm font-medium text-critical">
          {state.error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Stage" htmlFor="stage" required error={fe.stage}>
          <Select id="stage" name="stage" defaultValue="VERBAL_WARNING">
            {DISCIPLINARY_STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status" htmlFor="status" required error={fe.status}>
          <Select id="status" name="status" defaultValue="OPEN">
            {DISCIPLINARY_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Incident date" htmlFor="incidentDate" required error={fe.incidentDate}>
          <Input id="incidentDate" name="incidentDate" type="date" defaultValue={today} />
        </Field>
        <Field label="Meeting date" htmlFor="meetingDate" required error={fe.meetingDate}>
          <Input id="meetingDate" name="meetingDate" type="date" defaultValue={today} />
        </Field>
        <Field label="Review date" htmlFor="reviewDate" error={fe.reviewDate}>
          <Input id="reviewDate" name="reviewDate" type="date" />
        </Field>
      </div>

      <Field label="Description" htmlFor="description" required error={fe.description}>
        <Textarea
          id="description"
          name="description"
          rows={4}
          placeholder="What happened and the background to the matter."
        />
      </Field>

      <Field label="Outcome" htmlFor="outcome" required error={fe.outcome}>
        <Textarea
          id="outcome"
          name="outcome"
          rows={3}
          placeholder="Agreed actions, sanctions or next steps."
        />
      </Field>

      <Field label="Managed by" htmlFor="managedBy" required error={fe.managedBy}>
        <Input id="managedBy" name="managedBy" placeholder="Manager name" className="sm:max-w-sm" />
      </Field>

      <div className="space-y-3 rounded-lg border border-line bg-surface-2/50 p-4">
        <label className="flex items-center gap-2.5 text-sm text-ink-soft">
          <input
            type="checkbox"
            name="witnessPresent"
            checked={witness}
            onChange={(e) => setWitness(e.target.checked)}
            className="size-4 rounded border-line-strong accent-primary"
          />
          Witness present
        </label>
        {witness && (
          <Field label="Witness name" htmlFor="witnessName" error={fe.witnessName}>
            <Input id="witnessName" name="witnessName" className="sm:max-w-sm" />
          </Field>
        )}
        <label className="flex items-center gap-2.5 text-sm text-ink-soft">
          <input
            type="checkbox"
            name="staffAcknowledged"
            className="size-4 rounded border-line-strong accent-primary"
          />
          Staff member acknowledged the outcome
        </label>
      </div>

      <div className="flex items-center gap-3 border-t border-line pt-5">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Record disciplinary"}
        </Button>
        <Link href={cancelHref} className={buttonClasses({ variant: "ghost" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
