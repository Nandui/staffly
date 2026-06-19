"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { BadgeCheck } from "lucide-react";
import {
  DataTable,
  facetedFilter,
  type FacetConfig,
} from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { CertStatusBadge } from "@/components/staffly/certifications/CertStatusBadge";
import { cn, formatDate } from "@/lib/utils";
import { certStatusFromExpiry, daysUntil } from "@/lib/staffly/utils";
import { CERT_STATUS_META } from "@/lib/staffly/constants";
import type { CertRow } from "@/lib/staffly/data/certifications";

type CertOverviewRow = CertRow & { status: string; days: number };

type Group = "all" | "le30" | "to90" | "expired";

const GROUPS: { value: Group; label: string }[] = [
  { value: "all", label: "All" },
  { value: "le30", label: "Expiring ≤30d" },
  { value: "to90", label: "Expiring 31–90d" },
  { value: "expired", label: "Expired" },
];

export function CertOverviewTable({ rows }: { rows: CertRow[] }) {
  const [group, setGroup] = React.useState<Group>("all");
  const [requiredOnly, setRequiredOnly] = React.useState(false);

  const enriched: CertOverviewRow[] = React.useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        status: certStatusFromExpiry(r.expiryDate),
        days: daysUntil(r.expiryDate),
      })),
    [rows],
  );

  const data = React.useMemo(() => {
    return enriched.filter((r) => {
      if (requiredOnly && !r.roleRequired) return false;
      if (group === "le30") return r.days >= 0 && r.days <= 30;
      if (group === "to90") return r.days > 30 && r.days <= 90;
      if (group === "expired") return r.days < 0;
      return true;
    });
  }, [enriched, group, requiredOnly]);

  const columns: ColumnDef<CertOverviewRow>[] = [
    {
      id: "staff",
      accessorFn: (r) => `${r.staffName} ${r.certType} ${r.certNumber}`,
      header: "Staff",
      cell: ({ row }) => (
        <Link
          href={`/staff/${row.original.staffId}/certifications`}
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
      filterFn: facetedFilter<CertOverviewRow>(),
    },
    {
      accessorKey: "certType",
      id: "certType",
      header: "Cert type",
      cell: ({ row }) => (
        <span className="text-sm text-ink">{row.original.certType}</span>
      ),
      filterFn: facetedFilter<CertOverviewRow>(),
    },
    {
      accessorKey: "certNumber",
      header: "Cert no.",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.certNumber || "—"}
        </span>
      ),
    },
    {
      accessorKey: "expiryDate",
      header: "Expiry",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {formatDate(row.original.expiryDate)}
        </span>
      ),
    },
    {
      accessorKey: "days",
      header: "Days left",
      cell: ({ row }) => {
        const d = row.original.days;
        return (
          <span
            className={cn(
              "font-mono text-sm tnum",
              d < 0 ? "text-cert-expired" : d <= 90 ? "text-cert-expiring" : "text-ink-soft",
            )}
          >
            {d}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <CertStatusBadge status={row.original.status as "valid" | "expiring" | "expired"} />
      ),
      filterFn: facetedFilter<CertOverviewRow>(),
    },
    {
      id: "roleRequired",
      header: "Required",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.roleRequired ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
            <BadgeCheck className="size-3.5" /> Yes
          </span>
        ) : (
          <span className="text-xs text-faint">—</span>
        ),
    },
  ];

  const facets: FacetConfig[] = [
    {
      columnId: "centerName",
      title: "Centre",
      options: [...new Set(rows.map((r) => r.centerName))]
        .sort()
        .map((c) => ({ label: c, value: c })),
    },
    {
      columnId: "certType",
      title: "Cert type",
      options: [...new Set(rows.map((r) => r.certType))]
        .sort()
        .map((c) => ({ label: c, value: c })),
    },
    {
      columnId: "status",
      title: "Status",
      options: (["valid", "expiring", "expired"] as const).map((s) => ({
        label: CERT_STATUS_META[s].label,
        value: s,
      })),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex rounded-lg border border-line bg-surface p-0.5">
          {GROUPS.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => setGroup(g.value)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                group === g.value
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-ink",
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
        <Button
          variant={requiredOnly ? "primary" : "outline"}
          size="sm"
          onClick={() => setRequiredOnly((v) => !v)}
        >
          <BadgeCheck className="size-4" /> Role required only
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchable
        searchPlaceholder="Search staff, cert type or number…"
        facets={facets}
        initialSorting={[{ id: "days", desc: false }]}
        emptyState="No certifications match these filters."
      />
    </div>
  );
}
