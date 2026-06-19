import { cn } from "@/lib/utils";
import { STAFF_STATUS_META } from "@/lib/staffly/constants";

export function StaffStatusBadge({ status }: { status: string }) {
  const meta = STAFF_STATUS_META[status] ?? STAFF_STATUS_META.INACTIVE;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        meta.pill,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}
