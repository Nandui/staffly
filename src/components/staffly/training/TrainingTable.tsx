"use client";

import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/staffly/shared/ConfirmDialog";
import { CertStatusBadge } from "@/components/staffly/certifications/CertStatusBadge";
import { cn, formatDate } from "@/lib/utils";
import { certStatusFromExpiry } from "@/lib/staffly/utils";
import {
  TRAINING_CATEGORIES,
  TRAINING_CATEGORY_LABEL,
  TRAINING_DELIVERY_LABEL,
  TRAINING_OUTCOME_META,
  type CertStatus,
} from "@/lib/staffly/constants";
import { deleteTraining } from "@/lib/staffly/actions/training";

export interface TrainingRowView {
  id: string;
  title: string;
  category: string;
  delivery: string;
  deliveredBy: string;
  completedDate: Date | string;
  durationHours: number;
  outcome: string;
  expiryDate: Date | string | null;
}

function statusFor(row: TrainingRowView): CertStatus {
  if (row.outcome === "IN_PROGRESS" || row.outcome === "PENDING") return "pending";
  if (row.expiryDate) return certStatusFromExpiry(row.expiryDate);
  return "valid";
}

export function TrainingTable({
  rows,
  canManage = false,
}: {
  rows: TrainingRowView[];
  canManage?: boolean;
}) {
  const order = TRAINING_CATEGORIES.map((c) => c.value);
  const groups = order
    .map((cat) => ({ cat, items: rows.filter((r) => r.category === cat) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <div key={g.cat}>
          <h3 className="mb-2 text-sm font-semibold text-ink">
            {TRAINING_CATEGORY_LABEL[g.cat]}
            <span className="ml-2 font-normal text-muted-foreground tnum">
              {g.items.length}
            </span>
          </h3>
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-xs">
            <Table>
              <TableHeader className="bg-surface-2/60">
                <TableRow className="hover:bg-transparent">
                  <TableHead>Title</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Delivered by</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  {canManage && <TableHead />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {g.items.map((r) => {
                  const outcome = TRAINING_OUTCOME_META[r.outcome];
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium text-ink">
                        {r.title}
                        <span className="block text-xs font-normal text-muted-foreground">
                          {TRAINING_DELIVERY_LABEL[r.delivery]}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {formatDate(r.completedDate)}
                      </TableCell>
                      <TableCell className="text-sm text-ink-soft">
                        {r.deliveredBy}
                      </TableCell>
                      <TableCell className="font-mono text-sm tnum">
                        {r.durationHours}h
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                            outcome?.pill,
                          )}
                        >
                          {outcome?.label ?? r.outcome}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {r.expiryDate ? formatDate(r.expiryDate) : "—"}
                      </TableCell>
                      <TableCell>
                        <CertStatusBadge status={statusFor(r)} />
                      </TableCell>
                      {canManage && (
                        <TableCell className="text-right">
                          <ConfirmDialog
                            title="Delete this training record?"
                            confirmLabel="Delete"
                            successMessage="Training record deleted"
                            onConfirm={() => deleteTraining(r.id)}
                            trigger={
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Delete"
                              >
                                <Trash2 className="size-4 text-muted-foreground" />
                              </Button>
                            }
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
}
