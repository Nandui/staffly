import { cn } from "@/lib/utils";

export type CellStatus = "valid" | "expiring" | "expired" | "missing" | "na";

const STYLES: Record<CellStatus, { box: string; label: string }> = {
  valid: { box: "bg-cert-valid-bg text-cert-valid border-cert-valid-line", label: "✓" },
  expiring: {
    box: "bg-cert-expiring-bg text-cert-expiring border-cert-expiring-line",
    label: "!",
  },
  expired: {
    box: "bg-cert-expired-bg text-cert-expired border-cert-expired-line",
    label: "✕",
  },
  missing: {
    box: "bg-cert-pending-bg text-cert-pending border-slate-200",
    label: "—",
  },
  na: { box: "bg-transparent text-faint border-transparent", label: "–" },
};

// One training-matrix cell: a colour-coded compliance chip.
export function TrainingStatusCell({
  status,
  className,
}: {
  status: CellStatus;
  className?: string;
}) {
  const s = STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-md border text-xs font-semibold",
        s.box,
        className,
      )}
      aria-label={status}
    >
      {s.label}
    </span>
  );
}
