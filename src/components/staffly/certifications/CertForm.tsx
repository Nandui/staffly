"use client";

import * as React from "react";
import { useActionState } from "react";
import { addMonths } from "date-fns";
import { Check, ChevronsUpDown } from "lucide-react";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SheetBody, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { useSheetSuccess } from "@/components/staffly/shared/FormSheet";
import { cn, toDateInputValue } from "@/lib/utils";
import { addCertRecord } from "@/lib/staffly/actions/certifications";
import type { FormState } from "@/lib/form";

interface CertTypeOption {
  id: string;
  name: string;
  issuingBody: string;
  validityMonths: number;
}

export function CertForm({
  staffId,
  certTypes,
  onSuccess,
}: {
  staffId: string;
  certTypes: CertTypeOption[];
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    addCertRecord,
    null,
  );
  useSheetSuccess(state?.ok, "Certification recorded", onSuccess);
  const fe = state?.fieldErrors ?? {};

  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<CertTypeOption | null>(null);
  const today = new Date().toISOString().slice(0, 10);
  const [issueDate, setIssueDate] = React.useState(today);
  const [expiry, setExpiry] = React.useState("");

  // Auto-compute expiry from issue date + the cert type's validity window.
  React.useEffect(() => {
    if (selected && issueDate && !Number.isNaN(Date.parse(issueDate))) {
      setExpiry(
        toDateInputValue(addMonths(new Date(issueDate), selected.validityMonths)),
      );
    }
  }, [selected, issueDate]);

  return (
    <form action={formAction} className="flex min-h-0 flex-1 flex-col">
      <input type="hidden" name="staffId" value={staffId} />
      <input type="hidden" name="certTypeId" value={selected?.id ?? ""} />
      <SheetBody className="space-y-4">
        {state?.error && (
          <div className="rounded-lg border border-critical-line bg-critical-bg px-3 py-2 text-sm font-medium text-critical">
            {state.error}
          </div>
        )}

        <Field label="Cert type" required error={fe.certTypeId}>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                role="combobox"
                aria-expanded={open}
                className="flex h-10 w-full items-center justify-between rounded-lg border border-line-strong bg-surface px-3 text-sm shadow-xs"
              >
                <span className={cn(!selected && "text-faint")}>
                  {selected ? selected.name : "Search cert types…"}
                </span>
                <ChevronsUpDown className="size-4 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search cert types…" />
                <CommandList>
                  <CommandEmpty>No cert types found.</CommandEmpty>
                  <CommandGroup>
                    {certTypes.map((c) => (
                      <CommandItem
                        key={c.id}
                        value={`${c.name} ${c.issuingBody}`}
                        onSelect={() => {
                          setSelected(c);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "size-4",
                            selected?.id === c.id ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span className="flex-1">{c.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {c.issuingBody}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </Field>

        <Field label="Cert number" htmlFor="certNumber" error={fe.certNumber}>
          <Input id="certNumber" name="certNumber" placeholder="Optional reference" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Issue date" htmlFor="issueDate" required error={fe.issueDate}>
            <Input
              id="issueDate"
              name="issueDate"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </Field>
          <Field
            label="Expiry date"
            htmlFor="expiryDate"
            required
            error={fe.expiryDate}
            hint="Auto-set from validity — editable."
          >
            <Input
              id="expiryDate"
              name="expiryDate"
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
            />
          </Field>
        </div>

        <Field label="Notes" htmlFor="notes" error={fe.notes}>
          <Textarea id="notes" name="notes" rows={2} />
        </Field>
      </SheetBody>
      <SheetFooter>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Add certification"}
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
