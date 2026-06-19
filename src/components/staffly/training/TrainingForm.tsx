"use client";

import * as React from "react";
import { useActionState } from "react";
import { addMonths } from "date-fns";
import {
  Check,
  ChevronsUpDown,
  BookOpen,
  PenLine,
  CheckCircle2,
} from "lucide-react";
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
import { recordModuleCompletions } from "@/lib/staffly/actions/training-modules";
import type { FormState } from "@/lib/form";

interface ModuleOption {
  id: string;
  title: string;
  hasAssessment: boolean;
  passMark: number | null;
  completed: boolean;
}

interface ProgrammeOption {
  id: string;
  name: string;
  category: string;
  isOneTime: boolean;
  refreshIntervalMonths: number | null;
  modules: ModuleOption[];
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
  const [logState, logAction, logPending] = useActionState<FormState, FormData>(
    logTraining,
    null,
  );
  const [modState, modAction, modPending] = useActionState<FormState, FormData>(
    recordModuleCompletions,
    null,
  );
  useSheetSuccess(logState?.ok, "Training logged", onSuccess);
  useSheetSuccess(modState?.ok, "Modules recorded", onSuccess);

  const [mode, setMode] = React.useState<"library" | "adhoc">(
    programmes.length ? "library" : "adhoc",
  );
  const [open, setOpen] = React.useState(false);
  const [programme, setProgramme] = React.useState<ProgrammeOption | null>(null);
  const [category, setCategory] = React.useState("INDUCTION");
  const today = new Date().toISOString().slice(0, 10);
  const [completed, setCompleted] = React.useState(today);
  const [expiry, setExpiry] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const mods = programme?.modules ?? [];
  const moduleMode = mode === "library" && !!programme && mods.length > 0;
  const noProgramme = mode === "library" && !programme;

  const state = moduleMode ? modState : logState;
  const action = moduleMode ? modAction : logAction;
  const pending = moduleMode ? modPending : logPending;
  const fe = state?.fieldErrors ?? {};

  // When a programme is picked, default-tick its not-yet-completed modules.
  React.useEffect(() => {
    if (programme) {
      setSelected(
        new Set(programme.modules.filter((m) => !m.completed).map((m) => m.id)),
      );
    }
  }, [programme]);

  React.useEffect(() => {
    if (mode === "library" && programme) setCategory(programme.category);
  }, [mode, programme]);

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

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <form action={action} className="flex min-h-0 flex-1 flex-col">
      <input type="hidden" name="staffId" value={staffId} />
      {!moduleMode && (
        <input
          type="hidden"
          name="programmeId"
          value={mode === "library" ? (programme?.id ?? "") : ""}
        />
      )}
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

        {mode === "library" && (
          <Field label="Programme" required>
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
                          <span className="flex-1">{p.name}</span>
                          {p.modules.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {p.modules.length} module
                              {p.modules.length === 1 ? "" : "s"}
                            </span>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </Field>
        )}

        {noProgramme ? (
          <p className="text-sm text-muted-foreground">
            Choose a programme to continue.
          </p>
        ) : moduleMode ? (
          // ── Module checklist (library programme that has modules) ──────────
          <>
            <Field
              label="Completed on"
              htmlFor="completedDate"
              required
              error={fe.completedDate}
              className="max-w-[14rem]"
            >
              <Input
                id="completedDate"
                name="completedDate"
                type="date"
                value={completed}
                onChange={(e) => setCompleted(e.target.value)}
              />
            </Field>

            <div className="space-y-2">
              <p className="text-sm font-medium text-ink">
                Modules{" "}
                <span className="font-normal text-muted-foreground">
                  ({selected.size}/{mods.length} selected)
                </span>
              </p>
              <ul className="divide-y divide-line rounded-lg border border-line">
                {mods.map((m) => {
                  const checked = selected.has(m.id);
                  return (
                    <li key={m.id} className="px-3 py-2.5">
                      <label className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          name="moduleIds"
                          value={m.id}
                          checked={checked}
                          onChange={() => toggle(m.id)}
                          className="mt-0.5 size-4 rounded border-line-strong accent-primary"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="text-sm font-medium text-ink">
                              {m.title}
                            </span>
                            {m.completed && (
                              <span className="inline-flex items-center gap-0.5 text-[0.7rem] font-medium text-cert-valid">
                                <CheckCircle2 className="size-3" /> recorded
                              </span>
                            )}
                            {m.hasAssessment && (
                              <span className="text-[0.7rem] text-muted-foreground">
                                {m.passMark != null
                                  ? `${m.passMark}% to pass`
                                  : "assessed"}
                              </span>
                            )}
                          </span>
                          {m.hasAssessment && checked && (
                            <span className="mt-2 block max-w-[12rem]">
                              <Input
                                name={`score_${m.id}`}
                                type="number"
                                min={0}
                                max={100}
                                placeholder="Score %"
                              />
                            </span>
                          )}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              <p className="text-xs text-muted-foreground">
                Ticked modules are recorded as complete on the date above.
              </p>
            </div>
          </>
        ) : (
          // ── Single record (ad hoc, or a library programme with no modules) ──
          <>
            {mode === "library" ? (
              <input type="hidden" name="title" value={programme?.name ?? ""} />
            ) : (
              <Field label="Title" htmlFor="title" required error={fe.title}>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Manual handling refresher"
                />
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
              <Field
                label="Delivered by"
                htmlFor="deliveredBy"
                required
                error={fe.deliveredBy}
              >
                <Input
                  id="deliveredBy"
                  name="deliveredBy"
                  placeholder="Trainer / provider"
                />
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
          </>
        )}
      </SheetBody>
      <SheetFooter>
        <Button type="submit" disabled={pending || noProgramme}>
          {pending
            ? "Saving…"
            : moduleMode
              ? "Record modules"
              : "Log training"}
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
