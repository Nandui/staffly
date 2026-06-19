import { cn } from "@/lib/utils";
import {
  certStatusFromExpiry,
  daysUntil,
  expiryCountdownLabel,
} from "@/lib/staffly/utils";
import { CERT_STATUS_META } from "@/lib/staffly/constants";

// Mono, colour-coded "expires in N days" / "expired N days ago".
export function ExpiryCountdown({
  expiryDate,
  className,
}: {
  expiryDate: Date | string;
  className?: string;
}) {
  const days = daysUntil(expiryDate);
  const status = certStatusFromExpiry(expiryDate);
  return (
    <span
      className={cn("font-mono text-xs", CERT_STATUS_META[status].text, className)}
    >
      {expiryCountdownLabel(days)}
    </span>
  );
}
