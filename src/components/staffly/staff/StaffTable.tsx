"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ShieldAlert, Users } from "lucide-react";
import {
  DataTable,
  DataTableColumnHeader,
  facetedFilter,
  type FacetConfig,
} from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StaffStatusBadge } from "@/components/staffly/staff/StaffStatusBadge";
import { cn, formatDate } from "@/lib/utils";
import { staffInitials } from "@/lib/staffly/utils";
import { BRADFORD_LEVEL_META, STAFF_STATUSES } from "@/lib/staffly/constants";
import type { StaffRow } from "@/lib/staffly/data/staff";

function CertHealthBar({ row }: { row: StaffRow }) {
  const { valid, expiring, expired, total } = row.certHealth;
  if (total === 0) {
    return <span className="text-xs text-faint">—</span>;
  }
  const seg = (n: number) => `${(n / total) * 100}%`;
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-1.5 w-20 overflow-hidden rounded-full bg-surface-2">
        {expired > 0 && (
          <span className="bg-cert-expired" style={{ width: seg(expired) }} />
        )}
        {expiring > 0 && (
          <span className="bg-cert-expiring" style={{ width: seg(expiring) }} />
        )}
        {valid > 0 && (
          <span className="bg-cert-valid" style={{ width: seg(valid) }} />
        )}
      </div>
      <span className="font-mono text-xs text-muted-foreground">
        {valid}/{total}
      </span>
    </div>
  );
}

export function StaffTable({ rows }: { rows: StaffRow[] }) {
  const router = useRouter();
  const [issuesOnly, setIssuesOnly] = React.useState(false);

  const data = React.useMemo(
    () =>
      issuesOnly
        ? rows.filter(
            (r) => r.certHealth.expired > 0 || r.certHealth.expiring > 0,
          )
        : rows,
    [rows, issuesOnly],
  );

  const centreOptions = React.useMemo(
    () =>
      [...new Set(rows.map((r) => r.centerName))]
        .sort()
        .map((c) => ({ label: c, value: c })),
    [rows],
  );
  const roleOptions = React.useMemo(
    () =>
      [...new Set(rows.map((r) => r.roleName).filter(Boolean) as string[])]
        .sort()
        .map((r) => ({ label: r, value: r })),
    [rows],
  );

  const columns: ColumnDef<StaffRow>[] = [
    {
      id: "staff",
      accessorFn: (r) => `${r.firstName} ${r.lastName} ${r.email} ${r.roleName ?? ""}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Staff member" />
      ),
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-9">
              {s.photo && <AvatarImage src={s.photo} alt="" />}
              <AvatarFallback>{staffInitials(s)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium text-ink">
                {s.firstName} {s.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {s.roleName ?? "No role"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "centerName",
      id: "centerName",
      header: "Centre",
      cell: ({ row }) => (
        <span className="text-sm text-ink-soft">{row.original.centerName}</span>
      ),
      filterFn: facetedFilter<StaffRow>(),
    },
    {
      accessorKey: "roleName",
      id: "roleName",
      header: "Role",
      filterFn: facetedFilter<StaffRow>(),
    },
    {
      accessorKey: "status",
      id: "status",
      header: "Status",
      cell: ({ row }) => <StaffStatusBadge status={row.original.status} />,
      filterFn: facetedFilter<StaffRow>(),
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Start date" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {formatDate(row.original.startDate)}
        </span>
      ),
    },
    {
      accessorKey: "absencesYtd",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Absence YTD" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm tnum text-ink-soft">
          {row.original.absencesYtd}d
        </span>
      ),
    },
    {
      accessorKey: "bradfordScore",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Bradford" />
      ),
      cell: ({ row }) => {
        const meta = BRADFORD_LEVEL_META[row.original.bradfordLevel];
        return (
          <span className={cn("font-mono text-sm font-semibold tnum", meta.text)}>
            {row.original.bradfordScore}
          </span>
        );
      },
    },
    {
      id: "certHealth",
      header: "Cert health",
      enableSorting: false,
      cell: ({ row }) => <CertHealthBar row={row.original} />,
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="text-right" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Actions">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {s.firstName} {s.lastName}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/staffly/staff/${s.id}/overview`}>Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/staffly/staff/${s.id}/absence`}>Absence</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/staffly/staff/${s.id}/certifications`}>
                    Certifications
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/staffly/staff/${s.id}/training`}>Training</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const facets: FacetConfig[] = [
    { columnId: "centerName", title: "Centre", options: centreOptions },
    { columnId: "roleName", title: "Role", options: roleOptions },
    {
      columnId: "status",
      title: "Status",
      options: STAFF_STATUSES.map((s) => ({ label: s.label, value: s.value })),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground tnum">
          {data.length} staff
        </p>
        <Button
          variant={issuesOnly ? "primary" : "outline"}
          size="sm"
          onClick={() => setIssuesOnly((v) => !v)}
        >
          <ShieldAlert className="size-4" /> Cert issues only
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        searchable
        searchPlaceholder="Search name, email or role…"
        facets={facets}
        initialColumnVisibility={{ roleName: false }}
        initialSorting={[{ id: "staff", desc: false }]}
        onRowClick={(r) => router.push(`/staffly/staff/${r.id}/overview`)}
        emptyState={
          <EmptyState
            icon={Users}
            title="No staff match your filters"
            description="Try clearing filters or adjusting your search."
          />
        }
      />
    </div>
  );
}
