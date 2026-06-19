"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  DataTable,
  DataTableColumnHeader,
  facetedFilter,
  type FacetConfig,
} from "@/components/ui/data-table";
import { cn, formatDateTime } from "@/lib/utils";
import type { AuditRow } from "@/lib/staffly/data/audit";

function verb(action: string): "created" | "updated" | "deleted" | "other" {
  if (/\.(deleted|deactivated)$/.test(action)) return "deleted";
  if (/\.(created|added|logged|uploaded|acknowledged|acknowledged_all|activated|rtw_completed)$/.test(action))
    return "created";
  if (/\.(updated|status_changed)$/.test(action)) return "updated";
  return "other";
}

const VERB_PILL: Record<string, string> = {
  created: "bg-cert-valid-bg text-cert-valid border border-cert-valid-line",
  updated: "bg-blue-50 text-blue-700 border border-blue-200",
  deleted: "bg-cert-expired-bg text-cert-expired border border-cert-expired-line",
  other: "bg-slate-100 text-slate-600 border border-slate-200",
};

export function AuditTable({ rows }: { rows: AuditRow[] }) {
  const columns: ColumnDef<AuditRow>[] = [
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="When" />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
          {formatDateTime(row.original.createdAt)}
        </span>
      ),
    },
    {
      accessorKey: "actorName",
      header: "Actor",
      cell: ({ row }) => (
        <span className="text-sm text-ink-soft">{row.original.actorName}</span>
      ),
    },
    {
      id: "summary",
      accessorFn: (r) => `${r.summary} ${r.action} ${r.actorName}`,
      header: "Change",
      cell: ({ row }) => {
        const v = verb(row.original.action);
        return (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex shrink-0 rounded-full px-2 py-0.5 text-[0.7rem] font-medium capitalize",
                VERB_PILL[v],
              )}
            >
              {v}
            </span>
            <span className="text-sm text-ink">{row.original.summary}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "entity",
      id: "entity",
      header: "Entity",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.entity}
        </span>
      ),
      filterFn: facetedFilter<AuditRow>(),
    },
  ];

  const facets: FacetConfig[] = [
    {
      columnId: "entity",
      title: "Entity",
      options: [...new Set(rows.map((r) => r.entity))]
        .sort()
        .map((e) => ({ label: e, value: e })),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      searchable
      searchPlaceholder="Search the audit trail…"
      facets={facets}
      initialSorting={[{ id: "createdAt", desc: true }]}
      pageSize={25}
      emptyState="No activity recorded yet."
    />
  );
}
