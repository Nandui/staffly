"use client";

import { useTransition } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { DataTable, facetedFilter, type FacetConfig } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import {
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_PRIORITY_META,
  type NotificationPriority,
} from "@/lib/staffly/constants";
import type { StafflyNotification } from "@/lib/staffly/notifications";
import {
  acknowledgeNotification,
  acknowledgeAll,
} from "@/lib/staffly/actions/notifications";

type Row = StafflyNotification & { statusLabel: string };

function AckButton({
  certRecordId,
  priority,
}: {
  certRecordId: string;
  priority: string;
}) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await acknowledgeNotification(certRecordId, priority);
          toast.success("Acknowledged");
        })
      }
    >
      <Check className="size-3.5" /> Acknowledge
    </Button>
  );
}

export function NotificationsTable({
  notifications,
  canManage,
  selectedId,
}: {
  notifications: StafflyNotification[];
  canManage: boolean;
  selectedId: string | null;
}) {
  const [pending, start] = useTransition();
  const data: Row[] = notifications.map((n) => ({
    ...n,
    statusLabel: n.acknowledged ? "Acknowledged" : "Pending",
  }));

  const columns: ColumnDef<Row>[] = [
    {
      accessorKey: "priority",
      id: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const meta = NOTIFICATION_PRIORITY_META[row.original.priority];
        return (
          <span
            className={cn(
              "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
              meta.pill,
            )}
          >
            {meta.label}
          </span>
        );
      },
      filterFn: facetedFilter<Row>(),
      sortingFn: (a, b) =>
        NOTIFICATION_PRIORITY_META[a.original.priority].rank -
        NOTIFICATION_PRIORITY_META[b.original.priority].rank,
    },
    {
      id: "staff",
      accessorFn: (r) => `${r.staffName} ${r.message}`,
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
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => (
        <span className="text-sm text-ink-soft">{row.original.message}</span>
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
      accessorKey: "statusLabel",
      id: "statusLabel",
      header: "Status",
      filterFn: facetedFilter<Row>(),
      cell: ({ row }) => {
        const n = row.original;
        if (n.acknowledged) {
          return (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-cert-valid">
              <Check className="size-3.5" /> Acknowledged
            </span>
          );
        }
        return canManage ? (
          <AckButton certRecordId={n.certRecordId} priority={n.priority} />
        ) : (
          <span className="text-xs text-muted-foreground">Pending</span>
        );
      },
    },
  ];

  const facets: FacetConfig[] = [
    {
      columnId: "priority",
      title: "Priority",
      options: NOTIFICATION_PRIORITIES.map((p) => ({
        label: p.label,
        value: p.value,
      })),
    },
    {
      columnId: "statusLabel",
      title: "Status",
      options: [
        { label: "Pending", value: "Pending" },
        { label: "Acknowledged", value: "Acknowledged" },
      ],
    },
  ];

  const hasPending = notifications.some(
    (n) =>
      !n.acknowledged &&
      NOTIFICATION_PRIORITY_META[n.priority as NotificationPriority].rank >=
        NOTIFICATION_PRIORITY_META.MEDIUM.rank,
  );

  return (
    <div className="space-y-3">
      {canManage && hasPending && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await acknowledgeAll(selectedId);
                toast.success("All medium+ alerts acknowledged");
              })
            }
          >
            <CheckCheck className="size-4" /> Acknowledge all
          </Button>
        </div>
      )}
      <DataTable
        columns={columns}
        data={data}
        searchable
        searchPlaceholder="Search alerts…"
        facets={facets}
        initialSorting={[{ id: "priority", desc: true }]}
        emptyState="No notifications — all certifications are current."
      />
    </div>
  );
}
