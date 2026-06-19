"use client";

import * as React from "react";
import { useActionState } from "react";
import { addMonths } from "date-fns";
import { Check, ChevronsUpDown, BookOpen, PenLine } from "lucide-react";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
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
import {
  TRAINING_CATEGORIES,
  TRAINING_DELIVERIES,
  TRAINING_OUTCOMES,
} from "@/lib/staffly/constants";
import { logTraining } from "@/lib/staffly/actions/training";
import type { FormState } from "@/lib/form";

interface ProgrammeOption {
  id: string;
  name: string;
  category: string;
  isOneTime: boolean;
  refreshIntervalMonths: number | null;
}

export function TrainingForm({
  staffId,
  programmes,
  onSuccess,
}: {
  staffId: string;
  programmes: ProgrammeOption[];
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    logTraining,
    null,
  );
  useSheetSuccess(state?.ok, "Training logged", onSuccess);
  const fe = state?.fieldErrors ?? {};

  const [mode, setMode] = React.useState<"library" | "adhoc">(
    programmes.length ? "library" : "adhoc",
  );
  const [open, setOpen] = React.useState(false);
  const [programme, setProgramme] = React.useState<ProgrammeOption | null>(null);
  const [category, setCategory] = React.useState("INDUCTION");
  const today = new Date().toISOString().slice(0, 10);
  const [completed, setCompleted] = React.useState(today);
  const [expiry, setExpiry] = React.useState("");

  React.useEffect(() => {
    if (
      mode === "library" &&
      programme &&
      !programme.isOneTime &&
      programme.refreshIntervalMonths &&
      completed &&
      !Number.isNaN(Date.parse(completed))
    ) {
      setExpiry(
        toDateInputValue(
          addMonths(new Date(completed), programme.refreshIntervalMonths),
        ),
      );
    }
  }, [mode, programme, completed]);

  React.useEffect(() => {
    if (mode === "library" && programme) setCategory(programme.category);
  }, [mode, programme]);

  return (
    <form action={formAction} className="flex min-h-0 flex-1 flex-col">
      <input type="hidden" name="staffId" value={staffId} />
      <input
        type="hidden"
        name="programmeId"
        value={mode === "library" ? (programme?.id ?? "") : ""}
      />
      <SheetBody className="space-y-4">
        {state?.error && (
          <div className="rounded-lg border border-critical-line bg-critical-bg px-3 py-2 text-sm font-medium text-critical">
            {state.error}
          </div>
        )}

        {programmes.length > 0 && (
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-surface-2 p-1">
            <button
              type="button"
              onClick={() => setMode("library")}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition-colors",
                mode === "library"
                  ? "bg-surface text-ink shadow-xs"
                  : "text-muted-foreground",
              )}
            >
              <BookOpen className="size-4" /> From library
            </button>
            <button
              type="button"
              onClick={() => setMode("adhoc")}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition-colors",
                mode === "adhoc"
                  ? "bg-surface text-ink shadow-xs"
                  : "text-muted-foreground",
              )}
            >
              <PenLine className="size-4" /> Ad hoc
            </button>
          </div>
        )}

        {mode === "library" ? (
          <Field label="Programme" required error={fe.title}>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  role="combobox"
                  className="flex h-10 w-full items-center justify-between rounded-lg border border-line-strong bg-surface px-3 text-sm shadow-xs"
                >
                  <span className={cn(!programme && "text-faint")}>
                    {programme ? programme.name : "Search programmes…"}
                  </span>
                  <ChevronsUpDown className="size-4 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0"
                align="start"
              >
                <Command>
                  <CommandInput placeholder="Search programmes…" />
                  <CommandList>
                    <CommandEmpty>No programmes found.</CommandEmpty>
                    <CommandGroup>
                      {programmes.map((p) => (
                        <CommandItem
                          key={p.id}
                          value={p.name}
                          onSelect={() => {
                            setProgramme(p);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "size-4",
                              programme?.id === p.id ? "opacity-100" : "opacity-0",
                            )}
                          />
                          {p.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <input type="hidden" name="title" value={programme?.name ?? ""} />
          </Field>
        ) : (
          <Field label="Title" htmlFor="title" required error={fe.title}>
            <Input id="title" name="title" placeholder="e.g. Manual handling refresher" />
          </Field>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Category" htmlFor="category" required error={fe.category}>
            <Select
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {TRAINING_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Delivery" htmlFor="delivery" required error={fe.delivery}>
            <Select id="delivery" name="delivery" defaultValue="IN_PERSON">
              {TRAINING_DELIVERIES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Completed date"
            htmlFor="completedDate"
            required
            error={fe.completedDate}
          >
            <Input
              id="completedDate"
              name="completedDate"
              type="date"
              value={completed}
              onChange={(e) => setCompleted(e.target.value)}
            />
          </Field>
          <Field
            label="Duration (hours)"
            htmlFor="durationHours"
            required
            error={fe.durationHours}
          >
            <Input
              id="durationHours"
              name="durationHours"
              type="number"
              min={0}
              step={0.5}
              defaultValue={1}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Delivered by" htmlFor="deliveredBy" required error={fe.deliveredBy}>
            <Input id="deliveredBy" name="deliveredBy" placeholder="Trainer / provider" />
          </Field>
          <Field label="Outcome" htmlFor="outcome" required error={fe.outcome}>
            <Select id="outcome" name="outcome" defaultValue="PASS">
              {TRAINING_OUTCOMES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field
          label="Expiry date"
          htmlFor="expiryDate"
          error={fe.expiryDate}
          hint="Optional — set for refresher training."
        >
          <Input
            id="expiryDate"
            name="expiryDate"
            type="date"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
          />
        </Field>

        <Field label="Notes" htmlFor="notes" error={fe.notes}>
          <Textarea id="notes" name="notes" rows={2} />
        </Field>
      </SheetBody>
      <SheetFooter>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Log training"}
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
