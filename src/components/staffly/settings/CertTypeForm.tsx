"use client";

import { useActionState } from "react";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SheetBody, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { useSheetSuccess } from "@/components/staffly/shared/FormSheet";
import type { FormState } from "@/lib/form";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export interface CertTypeValues {
  name: string;
  issuingBody: string;
  validityMonths: number;
  description: string;
}

export function CertTypeForm({
  action,
  certType,
  submitLabel,
  onSuccess,
}: {
  action: Action;
  certType?: CertTypeValues;
  submitLabel: string;
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    null,
  );
  useSheetSuccess(state?.ok, "Cert type saved", onSuccess);
  const fe = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex min-h-0 flex-1 flex-col">
      <SheetBody className="space-y-4">
        {state?.error && (
          <div className="rounded-lg border border-critical-line bg-critical-bg px-3 py-2 text-sm font-medium text-critical">
            {state.error}
          </div>
        )}
        <Field label="Name" htmlFor="name" required error={fe.name}>
          <Input id="name" name="name" defaultValue={certType?.name ?? ""} autoFocus />
        </Field>
        <Field label="Issuing body" htmlFor="issuingBody" required error={fe.issuingBody}>
          <Input
            id="issuingBody"
            name="issuingBody"
            defaultValue={certType?.issuingBody ?? ""}
            placeholder="e.g. RLSS, ISRM"
          />
        </Field>
        <Field
          label="Validity (months)"
          htmlFor="validityMonths"
          required
          error={fe.validityMonths}
          className="max-w-[12rem]"
        >
          <Input
            id="validityMonths"
            name="validityMonths"
            type="number"
            min={1}
            defaultValue={certType?.validityMonths ?? 24}
          />
        </Field>
        <Field label="Description" htmlFor="description" error={fe.description}>
          <Textarea
            id="description"
            name="description"
            rows={2}
            defaultValue={certType?.description ?? ""}
          />
        </Field>
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
