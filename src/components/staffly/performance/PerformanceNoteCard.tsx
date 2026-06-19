"use client";

import { Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/staffly/shared/ConfirmDialog";
import { cn, formatDate } from "@/lib/utils";
import {
  PERF_CATEGORY_META,
  PERF_VISIBILITY_LABEL,
} from "@/lib/staffly/constants";
import { deletePerformanceNote } from "@/lib/staffly/actions/performance";

export interface PerfNote {
  id: string;
  category: string;
  title: string;
  body: string;
  visibility: string;
  createdBy: string;
  noteDate: Date | string;
}

export function PerformanceNoteCard({
  note,
  canManage = false,
}: {
  note: PerfNote;
  canManage?: boolean;
}) {
  const meta = PERF_CATEGORY_META[note.category] ?? PERF_CATEGORY_META.REVIEW;
  const shared = note.visibility === "SHARED_WITH_STAFF";
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-l-4 border-line bg-surface p-4 shadow-xs",
        meta.border,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium",
                meta.pill,
              )}
            >
              {meta.label}
            </span>
            <h3 className="font-medium text-ink">{note.title}</h3>
          </div>
        </div>
        {canManage && (
          <ConfirmDialog
            title="Delete this note?"
            confirmLabel="Delete"
            successMessage="Note deleted"
            onConfirm={() => deletePerformanceNote(note.id)}
            trigger={
              <Button variant="ghost" size="icon" aria-label="Delete note">
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            }
          />
        )}
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft">{note.body}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="font-mono">{formatDate(note.noteDate)}</span>
        <span>·</span>
        <span>{note.createdBy}</span>
        <span>·</span>
        <span className="inline-flex items-center gap-1">
          {shared ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
          {PERF_VISIBILITY_LABEL[note.visibility]}
        </span>
      </div>
    </div>
  );
}
