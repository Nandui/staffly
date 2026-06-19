"use client";

import { useTransition } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Power, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { DataTable, facetedFilter, type FacetConfig } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FormSheet } from "@/components/staffly/shared/FormSheet";
import { ProgrammeForm } from "@/components/staffly/training/ProgrammeForm";
import { cn } from "@/lib/utils";
import { TRAINING_CATEGORIES, TRAINING_CATEGORY_LABEL } from "@/lib/staffly/constants";
import {
  createProgramme,
  updateProgramme,
  setProgrammeActive,
} from "@/lib/staffly/actions/training";

export interface ProgrammeView {
  id: string;
  name: string;
  description: string;
  category: string;
  requiredFor: { id: string; name: string }[];
  isOneTime: boolean;
  refreshIntervalMonths: number | null;
  active: boolean;
  records: number;
  modules: number;
}

export function ProgrammeTable({
  programmes,
  roles,
  canManage,
}: {
  programmes: ProgrammeView[];
  roles: { id: string; name: string }[];
  canManage: boolean;
}) {
  const [pending, startTransition] = useTransition();

  const columns: ColumnDef<ProgrammeView>[] = [
    {
      id: "name",
      accessorFn: (r) => `${r.name} ${r.description}`,
      header: "Programme",
      cell: ({ row }) => (
        <div className="min-w-0">
          <Link
            href={`/training-library/${row.original.id}`}
            className="font-medium text-ink hover:text-primary hover:underline"
          >
            {row.original.name}
          </Link>
          {row.original.description && (
            <p className="truncate text-xs text-muted-foreground">
              {row.original.description}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "category",
      id: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="text-sm text-ink-soft">
          {TRAINING_CATEGORY_LABEL[row.original.category]}
        </span>
      ),
      filterFn: facetedFilter<ProgrammeView>(),
    },
    {
      id: "requiredFor",
      header: "Required for",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.requiredFor.length ? (
          <span className="text-xs text-ink-soft">
            {row.original.requiredFor.map((r) => r.name).join(", ")}
          </span>
        ) : (
          <span className="text-xs text-faint">—</span>
        ),
    },
    {
      id: "frequency",
      header: "Frequency",
      cell: ({ row }) =>
        row.original.isOneTime ? (
          <span className="text-xs text-muted-foreground">One-time</span>
        ) : (
          <span className="text-xs text-muted-foreground">
            Every {row.original.refreshIntervalMonths} months
          </span>
        ),
    },
    {
      accessorKey: "modules",
      header: "Modules",
      cell: ({ row }) => (
        <span className="font-mono text-sm tnum">{row.original.modules}</span>
      ),
    },
    {
      accessorKey: "records",
      header: "Completions",
      cell: ({ row }) => (
        <span className="font-mono text-sm tnum">{row.original.records}</span>
      ),
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={cn(
            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
            row.original.active
              ? "bg-cert-valid-bg text-cert-valid border border-cert-valid-line"
              : "bg-slate-100 text-slate-500 border border-slate-200",
          )}
        >
          {row.original.active ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  if (canManage) {
    columns.push({
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <FormSheet
              title="Edit programme"
              trigger={
                <Button variant="ghost" size="icon" aria-label="Edit">
                  <Pencil className="size-4 text-muted-foreground" />
                </Button>
              }
            >
              {() => (
                <ProgrammeForm
                  action={updateProgramme.bind(null, p.id)}
                  roles={roles}
                  programme={{
                    name: p.name,
                    description: p.description,
                    category: p.category,
                    requiredForRoleIds: p.requiredFor.map((r) => r.id),
                    isOneTime: p.isOneTime,
                    refreshIntervalMonths: p.refreshIntervalMonths,
                    active: p.active,
                  }}
                  submitLabel="Save changes"
                />
              )}
            </FormSheet>
            <Button
              variant="ghost"
              size="icon"
              aria-label={p.active ? "Deactivate" : "Activate"}
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await setProgrammeActive(p.id, !p.active);
                  toast.success(p.active ? "Deactivated" : "Activated");
                })
              }
            >
              <Power
                className={cn("size-4", p.active ? "text-cert-valid" : "text-muted-foreground")}
              />
            </Button>
          </div>
        );
      },
    });
  }

  const facets: FacetConfig[] = [
    {
      columnId: "category",
      title: "Category",
      options: TRAINING_CATEGORIES.map((c) => ({ label: c.label, value: c.value })),
    },
  ];

  return (
    <div className="space-y-3">
      {canManage && (
        <div className="flex justify-end">
          <FormSheet
            title="Add training programme"
            description="Define a programme and the roles that require it."
            trigger={
              <Button size="sm">
                <Plus className="size-4" /> Add programme
              </Button>
            }
          >
            {() => (
              <ProgrammeForm
                action={createProgramme}
                roles={roles}
                submitLabel="Create programme"
              />
            )}
          </FormSheet>
        </div>
      )}
      <DataTable
        columns={columns}
        data={programmes}
        searchable
        searchPlaceholder="Search programmes…"
        facets={facets}
        initialSorting={[{ id: "name", desc: false }]}
        emptyState={
          <EmptyState
            icon={BookOpen}
            title="No programmes yet"
            description="Build a library of training programmes and link them to roles."
          />
        }
      />
    </div>
  );
}
