"use client";

import { useActionState } from "react";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SheetBody, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { useSheetSuccess } from "@/components/staffly/shared/FormSheet";
import type { FormState } from "@/lib/form";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export interface CentreValues {
  name: string;
  address: string | null;
  contactName: string | null;
  contactEmail: string | null;
  phone: string | null;
  notes: string | null;
  active: boolean;
}

export function CentreForm({
  action,
  centre,
  submitLabel,
  onSuccess,
}: {
  action: Action;
  centre?: CentreValues;
  submitLabel: string;
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    null,
  );
  useSheetSuccess(state?.ok, "Centre saved", onSuccess);
  const fe = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex min-h-0 flex-1 flex-col">
      <SheetBody className="space-y-4">
        {state?.error && (
          <div className="rounded-lg border border-critical-line bg-critical-bg px-3 py-2 text-sm font-medium text-critical">
            {state.error}
          </div>
        )}
        <Field label="Centre name" htmlFor="name" required error={fe.name}>
          <Input
            id="name"
            name="name"
            defaultValue={centre?.name ?? ""}
            placeholder="e.g. LeisureWorld Cork"
            autoFocus
          />
        </Field>
        <Field label="Address" htmlFor="address" error={fe.address}>
          <Textarea id="address" name="address" rows={2} defaultValue={centre?.address ?? ""} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Contact name" htmlFor="contactName" error={fe.contactName}>
            <Input id="contactName" name="contactName" defaultValue={centre?.contactName ?? ""} />
          </Field>
          <Field label="Contact email" htmlFor="contactEmail" error={fe.contactEmail}>
            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              defaultValue={centre?.contactEmail ?? ""}
            />
          </Field>
        </div>
        <Field label="Phone" htmlFor="phone" error={fe.phone} className="max-w-xs">
          <Input id="phone" name="phone" defaultValue={centre?.phone ?? ""} />
        </Field>
        <Field label="Notes" htmlFor="notes" error={fe.notes}>
          <Textarea id="notes" name="notes" rows={2} defaultValue={centre?.notes ?? ""} />
        </Field>
        <label className="flex items-center gap-2.5 text-sm text-ink-soft">
          <input
            type="checkbox"
            name="active"
            defaultChecked={centre?.active ?? true}
            className="size-4 rounded border-line-strong accent-primary"
          />
          Active — appears in the centre switcher
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
