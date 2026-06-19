import { cn } from "@/lib/utils";
import { CERT_STATUS_META, type CertStatus } from "@/lib/staffly/constants";

export function CertStatusBadge({
  status,
  className,
}: {
  status: CertStatus;
  className?: string;
}) {
  const meta = CERT_STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        meta.pill,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}
