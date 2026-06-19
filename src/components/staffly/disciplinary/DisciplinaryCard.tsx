"use client";

import { useTransition } from "react";
import { Check, ChevronDown, Trash2, UserCheck, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/staffly/shared/ConfirmDialog";
import { cn, formatDate } from "@/lib/utils";
import {
  DISCIPLINARY_STAGES,
  DISCIPLINARY_STAGE_META,
  DISCIPLINARY_STATUS_META,
  DISCIPLINARY_STATUSES,
} from "@/lib/staffly/constants";
import {
  setDisciplinaryStatus,
  deleteDisciplinary,
} from "@/lib/staffly/actions/disciplinary";

export interface DisciplinaryRecordView {
  id: string;
  stage: string;
  status: string;
  meetingDate: Date | string;
  incidentDate: Date | string;
  reviewDate: Date | string | null;
  description: string;
  outcome: string;
  managedBy: string;
  witnessPresent: boolean;
  witnessName: string | null;
  staffAcknowledged: boolean;
}

export function DisciplinaryCard({
  record,
  canManage = false,
}: {
  record: DisciplinaryRecordView;
  canManage?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const statusMeta =
    DISCIPLINARY_STATUS_META[record.status] ?? DISCIPLINARY_STATUS_META.OPEN;
  const currentOrder = DISCIPLINARY_STAGE_META[record.stage]?.order ?? 0;

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-ink">
            {DISCIPLINARY_STAGE_META[record.stage]?.label ?? record.stage}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Incident {formatDate(record.incidentDate)} · Meeting{" "}
            {formatDate(record.meetingDate)}
            {record.reviewDate && <> · Review {formatDate(record.reviewDate)}</>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canManage ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={pending}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                    statusMeta.pill,
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", statusMeta.dot)} />
                  {statusMeta.label}
                  <ChevronDown className="size-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Set status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {DISCIPLINARY_STATUSES.map((s) => (
                  <DropdownMenuItem
                    key={s.value}
                    onSelect={() =>
                      startTransition(async () => {
                        await setDisciplinaryStatus(record.id, s.value);
                        toast.success(`Marked ${s.label.toLowerCase()}`);
                      })
                    }
                  >
                    {s.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                statusMeta.pill,
              )}
            >
              {statusMeta.label}
            </span>
          )}
          {canManage && (
            <ConfirmDialog
              title="Delete this record?"
              confirmLabel="Delete"
              successMessage="Record deleted"
              onConfirm={() => deleteDisciplinary(record.id)}
              trigger={
                <Button variant="ghost" size="icon" aria-label="Delete">
                  <Trash2 className="size-4 text-muted-foreground" />
                </Button>
              }
            />
          )}
        </div>
      </div>

      {/* Stage stepper */}
      <div className="mt-4 flex items-center gap-1 overflow-x-auto">
        {DISCIPLINARY_STAGES.map((s, i) => {
          const done = i < currentOrder;
          const active = i === currentOrder;
          return (
            <div key={s.value} className="flex items-center gap-1">
              <span
                className={cn(
                  "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[0.7rem] font-medium",
                  active
                    ? "border-primary bg-accent text-accent-foreground"
                    : done
                      ? "border-cert-valid-line bg-cert-valid-bg text-cert-valid"
                      : "border-line bg-surface text-faint",
                )}
              >
                {done && <Check className="size-3" />}
                {s.short}
              </span>
              {i < DISCIPLINARY_STAGES.length - 1 && (
                <span className="h-px w-3 bg-line" aria-hidden />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <p className="text-ink-soft">{record.description}</p>
        <p>
          <span className="font-medium text-ink">Outcome: </span>
          <span className="text-ink-soft">{record.outcome}</span>
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-3 text-xs text-muted-foreground">
        <span>Managed by {record.managedBy}</span>
        {record.witnessPresent && (
          <span className="inline-flex items-center gap-1">
            <Eye className="size-3" /> Witness{" "}
            {record.witnessName ? `(${record.witnessName})` : "present"}
          </span>
        )}
        {record.staffAcknowledged && (
          <span className="inline-flex items-center gap-1 text-cert-valid">
            <UserCheck className="size-3" /> Acknowledged
          </span>
        )}
      </div>
    </div>
  );
}
