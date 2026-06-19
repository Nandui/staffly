"use client";

import { useActionState } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SheetBody, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { FileUpload } from "@/components/staffly/shared/FileUpload";
import { useSheetSuccess } from "@/components/staffly/shared/FormSheet";
import { DOCUMENT_CATEGORIES } from "@/lib/staffly/constants";
import { uploadDocument } from "@/lib/staffly/actions/documents";
import type { FormState } from "@/lib/form";

export function DocumentUploadForm({
  staffId,
  onSuccess,
}: {
  staffId: string;
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    uploadDocument,
    null,
  );
  useSheetSuccess(state?.ok, "Document uploaded", onSuccess);
  const fe = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex min-h-0 flex-1 flex-col">
      <input type="hidden" name="staffId" value={staffId} />
      <SheetBody className="space-y-4">
        {state?.error && (
          <div className="rounded-lg border border-critical-line bg-critical-bg px-3 py-2 text-sm font-medium text-critical">
            {state.error}
          </div>
        )}
        <Field label="Name" htmlFor="name" required error={fe.name}>
          <Input id="name" name="name" placeholder="e.g. Signed contract 2026" />
        </Field>
        <Field label="Category" htmlFor="category" required error={fe.category}>
          <Select id="category" name="category" defaultValue="CONTRACT">
            {DOCUMENT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="File" required error={fe.fileUrl}>
          <FileUpload />
        </Field>
        <Field
          label="Expiry date"
          htmlFor="expiryDate"
          error={fe.expiryDate}
          hint="Optional — flagged amber within 60 days."
        >
          <Input id="expiryDate" name="expiryDate" type="date" />
        </Field>
        <Field label="Notes" htmlFor="notes" error={fe.notes}>
          <Textarea id="notes" name="notes" rows={2} />
        </Field>
      </SheetBody>
      <SheetFooter>
        <Button type="submit" disabled={pending}>
          {pending ? "Uploading…" : "Upload document"}
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
