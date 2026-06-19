"use client";

import { FileText, FileImage, FileType, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/staffly/shared/ConfirmDialog";
import { cn, formatDate } from "@/lib/utils";
import { daysUntil } from "@/lib/staffly/utils";
import {
  DOCUMENT_CATEGORY_LABEL,
  DOCUMENT_CATEGORY_PILL,
  DOC_EXPIRING_SOON_DAYS,
} from "@/lib/staffly/constants";
import { deleteDocument } from "@/lib/staffly/actions/documents";

export interface DocView {
  id: string;
  name: string;
  category: string;
  filename: string;
  fileUrl: string;
  fileSizeKb: number;
  fileType: string;
  expiryDate: Date | string | null;
  uploadedBy: string;
  uploadedAt: Date | string;
}

function iconFor(fileType: string) {
  if (fileType.startsWith("image/")) return FileImage;
  if (fileType.includes("pdf")) return FileText;
  return FileType;
}

export function DocumentCard({
  doc,
  canManage = false,
}: {
  doc: DocView;
  canManage?: boolean;
}) {
  const Icon = iconFor(doc.fileType);
  const days = doc.expiryDate ? daysUntil(doc.expiryDate) : null;
  const expired = days != null && days < 0;
  const expiringSoon = days != null && days >= 0 && days <= DOC_EXPIRING_SOON_DAYS;

  return (
    <div className="flex flex-col rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <span className="flex size-10 items-center justify-center rounded-lg bg-surface-2 text-muted-foreground">
          <Icon className="size-5" />
        </span>
        <span
          className={cn(
            "inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium",
            DOCUMENT_CATEGORY_PILL[doc.category],
          )}
        >
          {DOCUMENT_CATEGORY_LABEL[doc.category]}
        </span>
      </div>

      <p className="mt-3 truncate font-medium text-ink" title={doc.name}>
        {doc.name}
      </p>
      <p className="text-xs text-muted-foreground">
        <span className="font-mono">{formatDate(doc.uploadedAt)}</span> ·{" "}
        {doc.fileSizeKb} KB
      </p>

      {(expired || expiringSoon) && (
        <span
          className={cn(
            "mt-2 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[0.7rem] font-medium",
            expired
              ? "bg-cert-expired-bg text-cert-expired border border-cert-expired-line"
              : "bg-cert-expiring-bg text-cert-expiring border border-cert-expiring-line",
          )}
        >
          {expired
            ? "Expired"
            : `Expires in ${days} day${days === 1 ? "" : "s"}`}
        </span>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
        <a
          href={doc.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          <Download className="size-3.5" /> View
        </a>
        {canManage && (
          <ConfirmDialog
            title="Delete this document?"
            description={`Remove "${doc.name}".`}
            confirmLabel="Delete"
            successMessage="Document deleted"
            onConfirm={() => deleteDocument(doc.id)}
            trigger={
              <Button variant="ghost" size="icon" aria-label="Delete">
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
