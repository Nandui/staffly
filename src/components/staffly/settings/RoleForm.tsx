"use client";

import { useActionState } from "react";
import { Field, Input, Select } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SheetBody, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { useSheetSuccess } from "@/components/staffly/shared/FormSheet";
import type { FormState } from "@/lib/form";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export interface RoleValues {
  name: string;
  centerId: string | null;
  active: boolean;
  requiredCertTypeIds: string[];
}

export function RoleForm({
  action,
  role,
  centers,
  certTypes,
  submitLabel,
  onSuccess,
}: {
  action: Action;
  role?: RoleValues;
  centers: { id: string; name: string }[];
  certTypes: { id: string; name: string }[];
  submitLabel: string;
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    null,
  );
  useSheetSuccess(state?.ok, "Role saved", onSuccess);
  const fe = state?.fieldErrors ?? {};
  const required = new Set(role?.requiredCertTypeIds ?? []);

  return (
    <form action={formAction} className="flex min-h-0 flex-1 flex-col">
      <SheetBody className="space-y-4">
        {state?.error && (
          <div className="rounded-lg border border-critical-line bg-critical-bg px-3 py-2 text-sm font-medium text-critical">
            {state.error}
          </div>
        )}
        <Field label="Role name" htmlFor="name" required error={fe.name}>
          <Input id="name" name="name" defaultValue={role?.name ?? ""} autoFocus />
        </Field>
        <Field label="Centre" htmlFor="centerId" error={fe.centerId}>
          <Select id="centerId" name="centerId" defaultValue={role?.centerId ?? ""}>
            <option value="">Organisation-wide</option>
            {centers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Required certifications" error={fe.requiredCertTypeIds}>
          <div className="grid gap-2 rounded-lg border border-line p-3">
            {certTypes.length === 0 && (
              <p className="text-xs text-muted-foreground">No cert types yet.</p>
            )}
            {certTypes.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  name="requiredCertTypeIds"
                  value={c.id}
                  defaultChecked={required.has(c.id)}
                  className="size-4 rounded border-line-strong accent-primary"
                />
                {c.name}
              </label>
            ))}
          </div>
        </Field>
        <label className="flex items-center gap-2.5 text-sm text-ink-soft">
          <input
            type="checkbox"
            name="active"
            defaultChecked={role?.active ?? true}
            className="size-4 rounded border-line-strong accent-primary"
          />
          Active
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
