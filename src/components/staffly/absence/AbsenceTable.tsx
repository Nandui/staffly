"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, AlertTriangle, Trash2, ClipboardCheck } from "lucide-react";
import {
  DataTable,
  facetedFilter,
  type FacetConfig,
} from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { FormSheet } from "@/components/staffly/shared/FormSheet";
import { ConfirmDialog } from "@/components/staffly/shared/ConfirmDialog";
import { RtwForm } from "@/components/staffly/absence/RtwForm";
import { cn, formatDate } from "@/lib/utils";
import { ABSENCE_TYPE_META, ABSENCE_TYPES } from "@/lib/staffly/constants";
import { deleteAbsence } from "@/lib/staffly/actions/absence";

export interface AbsenceRow {
  id: string;
  type: string;
  startDate: Date | string;
  endDate: Date | string;
  daysCount: number;
  reason: string;
  certProvided: boolean;
  approvedBy: string;
  returnToWorkCompletedAt: Date | string | null;
  staffId?: string;
  staffName?: string;
  centerName?: string;
}

const SICK = new Set(["SICK_UNCERTIFIED", "SICK_CERTIFIED"]);

export function AbsenceTable({
  rows,
  showStaff = false,
  canManage = false,
}: {
  rows: AbsenceRow[];
  showStaff?: boolean;
  canManage?: boolean;
}) {
  const columns: ColumnDef<AbsenceRow>[] = [];

  if (showStaff) {
    columns.push(
      {
        id: "staff",
        accessorFn: (r) => `${r.staffName ?? ""} ${r.reason}`,
        header: "Staff",
        cell: ({ row }) => (
          <Link
            href={`/staffly/staff/${row.original.staffId}/absence`}
            className="font-medium text-ink hover:text-primary hover:underline"
          >
            {row.original.staffName}
          </Link>
        ),
      },
      {
        accessorKey: "centerName",
        id: "centerName",
        header: "Centre",
        cell: ({ row }) => (
          <span className="text-sm text-ink-soft">{row.original.centerName}</span>
        ),
        filterFn: facetedFilter<AbsenceRow>(),
      },
    );
  }

  columns.push(
    {
      accessorKey: "type",
      id: "type",
      header: "Type",
      cell: ({ row }) => {
        const meta = ABSENCE_TYPE_META[row.original.type];
        return (
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
              meta?.pill,
            )}
          >
            {meta?.label ?? row.original.type}
          </span>
        );
      },
      filterFn: facetedFilter<AbsenceRow>(),
    },
    {
      accessorKey: "startDate",
      header: "Dates",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {formatDate(row.original.startDate)} → {formatDate(row.original.endDate)}
        </span>
      ),
    },
    {
      accessorKey: "daysCount",
      header: "Days",
      cell: ({ row }) => (
        <span className="font-mono text-sm tnum">{row.original.daysCount}</span>
      ),
    },
    {
      id: "cert",
      header: "Cert",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.certProvided ? (
          <CheckCircle2 className="size-4 text-cert-valid" />
        ) : (
          <span className="text-xs text-faint">—</span>
        ),
    },
    {
      accessorKey: "approvedBy",
      header: "Approved by",
      cell: ({ row }) => (
        <span className="text-sm text-ink-soft">{row.original.approvedBy}</span>
      ),
    },
    {
      id: "rtw",
      header: "RTW",
      enableSorting: false,
      cell: ({ row }) => {
        const a = row.original;
        if (!SICK.has(a.type)) return <span className="text-xs text-faint">n/a</span>;
        if (a.returnToWorkCompletedAt) {
          return (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-cert-valid">
              <CheckCircle2 className="size-3.5" /> Complete
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-cert-expiring">
            <AlertTriangle className="size-3.5" /> Pending
          </span>
        );
      },
    },
  );

  if (canManage) {
    columns.push({
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => {
        const a = row.original;
        const needsRtw = SICK.has(a.type) && !a.returnToWorkCompletedAt;
        return (
          <div className="flex items-center justify-end gap-1">
            {needsRtw && (
              <FormSheet
                title="Return-to-work interview"
                description="Record the RTW interview for this absence."
                trigger={
                  <Button variant="outline" size="sm">
                    <ClipboardCheck className="size-3.5" /> RTW
                  </Button>
                }
              >
                {({ close }) => <RtwForm absenceId={a.id} onSuccess={close} />}
              </FormSheet>
            )}
            <ConfirmDialog
              title="Delete this absence?"
              description="This removes the record and recalculates the Bradford Factor."
              confirmLabel="Delete"
              successMessage="Absence deleted"
              onConfirm={() => deleteAbsence(a.id)}
              trigger={
                <Button variant="ghost" size="icon" aria-label="Delete absence">
                  <Trash2 className="size-4 text-muted-foreground" />
                </Button>
              }
            />
          </div>
        );
      },
    });
  }

  const facets: FacetConfig[] = [
    {
      columnId: "type",
      title: "Type",
      options: ABSENCE_TYPES.map((t) => ({ label: t.label, value: t.value })),
    },
  ];
  if (showStaff) {
    facets.push({
      columnId: "centerName",
      title: "Centre",
      options: [...new Set(rows.map((r) => r.centerName).filter(Boolean) as string[])]
        .sort()
        .map((c) => ({ label: c, value: c })),
    });
  }

  return (
    <DataTable
      columns={columns}
      data={rows}
      searchable
      searchPlaceholder="Search absences…"
      facets={facets}
      initialSorting={[{ id: "startDate", desc: true }]}
      emptyState="No absences recorded."
    />
  );
}
