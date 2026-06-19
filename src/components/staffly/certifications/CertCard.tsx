"use client";

import { Trash2, ShieldCheck, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/staffly/shared/ConfirmDialog";
import { CertStatusBadge } from "@/components/staffly/certifications/CertStatusBadge";
import { ExpiryCountdown } from "@/components/staffly/certifications/ExpiryCountdown";
import { cn, formatDate } from "@/lib/utils";
import { certStatusFromExpiry } from "@/lib/staffly/utils";
import { CERT_STATUS_META } from "@/lib/staffly/constants";
import { deleteCertRecord } from "@/lib/staffly/actions/certifications";
import type { CertRow } from "@/lib/staffly/data/certifications";

const BORDER: Record<string, string> = {
  valid: "border-l-cert-valid",
  expiring: "border-l-cert-expiring",
  expired: "border-l-cert-expired",
  pending: "border-l-slate-300",
};

export function CertCard({
  cert,
  canManage = false,
}: {
  cert: CertRow;
  canManage?: boolean;
}) {
  const status = certStatusFromExpiry(cert.expiryDate);
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-l-4 border-line bg-surface p-4 shadow-xs",
        BORDER[status],
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <span
            className={cn(
              "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
              CERT_STATUS_META[status].pill,
            )}
          >
            <ShieldCheck className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="font-medium leading-tight text-ink">{cert.certType}</p>
            <p className="text-xs text-muted-foreground">{cert.issuingBody}</p>
          </div>
        </div>
        <CertStatusBadge status={status} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs">
        <dt className="text-muted-foreground">Issued</dt>
        <dd className="text-right font-mono text-ink-soft">
          {formatDate(cert.issueDate)}
        </dd>
        <dt className="text-muted-foreground">Expires</dt>
        <dd className="text-right font-mono text-ink-soft">
          {formatDate(cert.expiryDate)}
        </dd>
        {cert.certNumber && (
          <>
            <dt className="text-muted-foreground">Ref</dt>
            <dd className="truncate text-right font-mono text-ink-soft">
              {cert.certNumber}
            </dd>
          </>
        )}
      </dl>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
        <ExpiryCountdown expiryDate={cert.expiryDate} />
        <div className="flex items-center gap-2">
          {cert.roleRequired && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[0.7rem] font-medium text-accent-foreground">
              <BadgeCheck className="size-3" /> Role required
            </span>
          )}
          {canManage && (
            <ConfirmDialog
              title="Delete this certification?"
              description={`Remove ${cert.certType} from this record.`}
              confirmLabel="Delete"
              successMessage="Certification removed"
              onConfirm={() => deleteCertRecord(cert.id)}
              trigger={
                <Button variant="ghost" size="icon" aria-label="Delete">
                  <Trash2 className="size-4 text-muted-foreground" />
                </Button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
