"use client";

import * as React from "react";
import { useActionState } from "react";
import Link from "next/link";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Button, buttonClasses } from "@/components/ui/button";
import { toDateInputValue } from "@/lib/utils";
import { STAFF_STATUSES } from "@/lib/staffly/constants";
import type { FormState } from "@/lib/form";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export interface StaffFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  centerId: string;
  roleId: string | null;
  status: string;
  startDate: Date | string;
  endDate: Date | string | null;
  notes: string;
}

export function StaffForm({
  action,
  staff,
  centers,
  roles,
  submitLabel,
  cancelHref = "/staffly/staff",
}: {
  action: Action;
  staff?: StaffFormValues | null;
  centers: { id: string; name: string }[];
  roles: { id: string; name: string }[];
  submitLabel: string;
  cancelHref?: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    null,
  );
  const fe = state?.fieldErrors ?? {};
  const [status, setStatus] = React.useState(staff?.status ?? "ACTIVE");

  return (
    <form action={formAction} className="max-w-[680px] space-y-4">
      {state?.error && (
        <div className="rounded-lg border border-critical-line bg-critical-bg px-4 py-3 text-sm font-medium text-critical">
          {state.error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" htmlFor="firstName" required error={fe.firstName}>
          <Input
            id="firstName"
            name="firstName"
            defaultValue={staff?.firstName ?? ""}
            autoFocus
          />
        </Field>
        <Field label="Last name" htmlFor="lastName" required error={fe.lastName}>
          <Input id="lastName" name="lastName" defaultValue={staff?.lastName ?? ""} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" htmlFor="email" required error={fe.email}>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={staff?.email ?? ""}
            placeholder="name@leisureworld.ie"
          />
        </Field>
        <Field label="Phone" htmlFor="phone" error={fe.phone}>
          <Input id="phone" name="phone" defaultValue={staff?.phone ?? ""} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Centre" htmlFor="centerId" required error={fe.centerId}>
          <Select id="centerId" name="centerId" defaultValue={staff?.centerId ?? ""}>
            <option value="" disabled>
              Select a centre…
            </option>
            {centers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Role" htmlFor="roleId" error={fe.roleId}>
          <Select id="roleId" name="roleId" defaultValue={staff?.roleId ?? ""}>
            <option value="">No role</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status" htmlFor="status" required error={fe.status}>
          <Select
            id="status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STAFF_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Start date" htmlFor="startDate" required error={fe.startDate}>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={toDateInputValue(staff?.startDate ?? new Date())}
          />
        </Field>
      </div>

      {status === "INACTIVE" && (
        <Field
          label="End date"
          htmlFor="endDate"
          required
          error={fe.endDate}
          hint="Required when a staff member is marked inactive."
          className="sm:max-w-[20rem]"
        >
          <Input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={toDateInputValue(staff?.endDate ?? "")}
          />
        </Field>
      )}

      <Field label="Internal notes" htmlFor="notes" error={fe.notes}>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={staff?.notes ?? ""}
          placeholder="Anything useful — only managers can see this."
        />
      </Field>

      <div className="flex items-center gap-3 border-t border-line pt-5">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        <Link href={cancelHref} className={buttonClasses({ variant: "ghost" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
