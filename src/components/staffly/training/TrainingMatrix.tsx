"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Filter } from "lucide-react";
import { Select } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  TrainingStatusCell,
  type CellStatus,
} from "@/components/staffly/training/TrainingStatusCell";
import {
  ExcelExportButton,
  PdfExportButton,
} from "@/components/staffly/shared/ExportButtons";
import { cn, formatDate } from "@/lib/utils";
import { certStatusFromExpiry } from "@/lib/staffly/utils";
import type { TrainingMatrix as MatrixData, MatrixColumn, MatrixRow } from "@/lib/staffly/data/training";

function cellStatus(row: MatrixRow, col: MatrixColumn): CellStatus {
  const required =
    col.kind === "cert"
      ? row.requiredCertIds.includes(col.id)
      : row.requiredProgrammeIds.includes(col.id);
  const cell = row.cells[`${col.kind}:${col.id}`];
  if (!cell?.held) return required ? "missing" : "na";
  if (cell.expiryDate) {
    const s = certStatusFromExpiry(cell.expiryDate);
    return s === "pending" ? "valid" : s;
  }
  return "valid";
}

const STATUS_LABEL: Record<CellStatus, string> = {
  valid: "Compliant",
  expiring: "Expiring soon",
  expired: "Expired",
  missing: "Missing",
  na: "Not required",
};

export function TrainingMatrix({
  matrix,
  roles,
  currentRoleId,
}: {
  matrix: MatrixData;
  roles: { id: string; name: string }[];
  currentRoleId: string;
}) {
  const router = useRouter();
  const [issuesOnly, setIssuesOnly] = React.useState(false);

  const certCols = matrix.columns.filter((c) => c.kind === "cert");
  const progCols = matrix.columns.filter((c) => c.kind === "programme");

  const rowHasIssue = (row: MatrixRow) =>
    matrix.columns.some((c) => {
      const s = cellStatus(row, c);
      return s === "expiring" || s === "expired" || s === "missing";
    });

  const rows = issuesOnly ? matrix.rows.filter(rowHasIssue) : matrix.rows;

  // Summary over required cells.
  const summary = { valid: 0, expiring: 0, expired: 0, missing: 0 };
  for (const row of matrix.rows) {
    for (const col of matrix.columns) {
      const s = cellStatus(row, col);
      if (s === "valid") summary.valid += 1;
      else if (s === "expiring") summary.expiring += 1;
      else if (s === "expired") summary.expired += 1;
      else if (s === "missing") summary.missing += 1;
    }
  }

  const excelRows = matrix.rows.map((row) => {
    const obj: Record<string, string> = { Staff: row.staffName, Role: row.roleName ?? "" };
    for (const col of matrix.columns) {
      obj[col.name] = STATUS_LABEL[cellStatus(row, col)];
    }
    return obj;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="size-3.5" /> Role
          </span>
          <Select
            aria-label="Filter by role"
            value={currentRoleId}
            onChange={(e) => {
              const v = e.target.value;
              router.push(v ? `/training-matrix?role=${v}` : "/training-matrix");
            }}
            className="h-9 w-56"
          >
            <option value="">All roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
          <Button
            variant={issuesOnly ? "primary" : "outline"}
            size="sm"
            onClick={() => setIssuesOnly((v) => !v)}
          >
            Issues only
          </Button>
        </div>
        <div className="flex gap-2">
          <ExcelExportButton
            filename="staffly-training-matrix.xlsx"
            sheetName="Matrix"
            rows={excelRows}
          />
          <PdfExportButton
            targetId="training-matrix"
            filename="staffly-training-matrix.pdf"
            title="Training matrix"
          />
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryStat label="Compliant" value={summary.valid} tone="text-cert-valid" />
        <SummaryStat label="Expiring" value={summary.expiring} tone="text-cert-expiring" />
        <SummaryStat label="Expired" value={summary.expired} tone="text-cert-expired" />
        <SummaryStat label="Missing" value={summary.missing} tone="text-cert-expired" />
      </div>

      {matrix.columns.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-dashed border-line-strong bg-surface/60 px-4 py-10 text-center text-sm text-muted-foreground">
          No required certifications or programmes for this view. Set role
          requirements in Settings.
        </div>
      ) : (
        <div
          id="training-matrix"
          className="overflow-x-auto rounded-[var(--radius-card)] border border-line bg-surface shadow-xs"
        >
          <table className="border-collapse text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="sticky left-0 z-10 bg-surface-2 px-3 py-2 text-left" />
                {certCols.length > 0 && (
                  <th
                    colSpan={certCols.length}
                    className="border-l border-line bg-surface-2 px-3 py-1.5 text-center text-[0.7rem] font-semibold uppercase tracking-wide text-cert-valid"
                  >
                    Certifications
                  </th>
                )}
                {progCols.length > 0 && (
                  <th
                    colSpan={progCols.length}
                    className="border-l-2 border-line-strong bg-surface-2 px-3 py-1.5 text-center text-[0.7rem] font-semibold uppercase tracking-wide text-blue-700"
                  >
                    Training programmes
                  </th>
                )}
              </tr>
              <tr className="border-b border-line">
                <th className="sticky left-0 z-10 min-w-[12rem] bg-surface-2 px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  Staff
                </th>
                {matrix.columns.map((col, i) => (
                  <th
                    key={`${col.kind}:${col.id}`}
                    className={cn(
                      "min-w-[6rem] max-w-[8rem] px-2 py-2 text-center align-bottom text-[0.7rem] font-medium text-ink-soft",
                      col.kind === "programme" && progCols[0] === col
                        ? "border-l-2 border-line-strong"
                        : "border-l border-line",
                      i === 0 && "border-l border-line",
                    )}
                  >
                    <span className="line-clamp-3">{col.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.staffId} className="border-b border-line last:border-0">
                  <td className="sticky left-0 z-10 bg-surface px-3 py-2">
                    <Link
                      href={`/staff/${row.staffId}/training`}
                      className="font-medium text-ink hover:text-primary hover:underline"
                    >
                      {row.staffName}
                    </Link>
                    <span className="block text-xs text-muted-foreground">
                      {row.roleName ?? "No role"}
                    </span>
                  </td>
                  {matrix.columns.map((col) => {
                    const status = cellStatus(row, col);
                    const cell = row.cells[`${col.kind}:${col.id}`];
                    return (
                      <td
                        key={`${col.kind}:${col.id}`}
                        className={cn(
                          "px-2 py-2 text-center",
                          col.kind === "programme" && progCols[0] === col
                            ? "border-l-2 border-line-strong"
                            : "border-l border-line",
                        )}
                      >
                        <Popover>
                          <PopoverTrigger asChild>
                            <button type="button" aria-label={`${col.name}: ${STATUS_LABEL[status]}`}>
                              <TrainingStatusCell status={status} />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-60">
                            <p className="font-medium text-ink">{col.name}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {STATUS_LABEL[status]}
                            </p>
                            {cell?.expiryDate && (
                              <p className="mt-1 font-mono text-xs text-muted-foreground">
                                Expires {formatDate(cell.expiryDate)}
                              </p>
                            )}
                            {cell?.reference && (
                              <p className="font-mono text-xs text-muted-foreground">
                                Ref {cell.reference}
                              </p>
                            )}
                            <Link
                              href={`/staff/${row.staffId}/${
                                col.kind === "cert" ? "certifications" : "training"
                              }`}
                              className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
                            >
                              Update record →
                            </Link>
                          </PopoverContent>
                        </Popover>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-xs">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-2 font-display text-3xl font-semibold tnum", tone)}>
        {value}
      </p>
    </div>
  );
}
