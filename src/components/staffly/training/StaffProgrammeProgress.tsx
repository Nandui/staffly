"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CheckCircle2,
  Circle,
  Clock,
  ClipboardCheck,
  ExternalLink,
  FileText,
  RotateCcw,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormSheet } from "@/components/staffly/shared/FormSheet";
import { MarkModuleForm } from "@/components/staffly/training/MarkModuleForm";
import { cn, formatDate } from "@/lib/utils";
import { formatMinutes } from "@/lib/staffly/utils";
import { TRAINING_CATEGORY_LABEL } from "@/lib/staffly/constants";
import { clearModuleComplete } from "@/lib/staffly/actions/training-modules";

export interface ProgressResource {
  id: string;
  kind: "LINK" | "FILE";
  label: string;
  url: string;
}
export interface ProgressCompletion {
  completedDate: Date | string;
  score: number | null;
  passed: boolean;
  notes: string;
}
export interface ProgressModule {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number | null;
  hasAssessment: boolean;
  passMark: number | null;
  resources: ProgressResource[];
  completion: ProgressCompletion | null;
}
export interface ProgrammeProgressView {
  id: string;
  name: string;
  description: string;
  category: string;
  required: boolean;
  total: number;
  done: number;
  modules: ProgressModule[];
}

export function StaffProgrammeProgress({
  staffId,
  programmes,
  canManage,
}: {
  staffId: string;
  programmes: ProgrammeProgressView[];
  canManage: boolean;
}) {
  const [pending, startTransition] = useTransition();

  const clear = (moduleId: string) =>
    startTransition(async () => {
      await clearModuleComplete(moduleId, staffId);
      toast.success("Completion cleared");
    });

  return (
    <div className="space-y-4">
      {programmes.map((p) => {
        const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
        const complete = p.total > 0 && p.done === p.total;
        return (
          <div
            key={p.id}
            className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-xs"
          >
            <div className="border-b border-line px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/training-library/${p.id}`}
                      className="font-medium text-ink hover:text-primary hover:underline"
                    >
                      {p.name}
                    </Link>
                    {p.required && (
                      <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[0.7rem] font-medium text-accent-foreground">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {TRAINING_CATEGORY_LABEL[p.category] ?? p.category}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 font-mono text-sm font-semibold tnum",
                    complete ? "text-cert-valid" : "text-muted-foreground",
                  )}
                >
                  {p.done}/{p.total}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    complete ? "bg-cert-valid" : "bg-primary",
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <ul className="divide-y divide-line">
              {p.modules.map((m) => {
                const done = m.completion;
                return (
                  <li key={m.id} className="flex items-start gap-3 px-4 py-3">
                    {done ? (
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-cert-valid" />
                    ) : (
                      <Circle className="mt-0.5 size-5 shrink-0 text-faint" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">{m.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {m.estimatedMinutes ? (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3.5" />
                            {formatMinutes(m.estimatedMinutes)}
                          </span>
                        ) : null}
                        {m.hasAssessment && (
                          <span className="inline-flex items-center gap-1">
                            <ClipboardCheck className="size-3.5" />
                            {m.passMark != null ? `${m.passMark}% to pass` : "Assessment"}
                          </span>
                        )}
                        {done && (
                          <span className="text-ink-soft">
                            Completed {formatDate(done.completedDate)}
                            {done.score != null && (
                              <>
                                {" · "}
                                <span
                                  className={cn(
                                    "font-medium",
                                    done.passed ? "text-cert-valid" : "text-cert-expired",
                                  )}
                                >
                                  {done.score}% {done.passed ? "pass" : "fail"}
                                </span>
                              </>
                            )}
                          </span>
                        )}
                      </div>
                      {m.resources.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                          {m.resources.map((r) => (
                            <a
                              key={r.id}
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              {r.kind === "FILE" ? (
                                <FileText className="size-3" />
                              ) : (
                                <ExternalLink className="size-3" />
                              )}
                              {r.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {canManage && (
                      <div className="flex shrink-0 items-center gap-0.5">
                        {done ? (
                          <>
                            <FormSheet
                              title="Edit completion"
                              trigger={
                                <Button variant="ghost" size="icon" aria-label="Edit completion">
                                  <Pencil className="size-4 text-muted-foreground" />
                                </Button>
                              }
                            >
                              {({ close }) => (
                                <MarkModuleForm
                                  moduleId={m.id}
                                  staffId={staffId}
                                  hasAssessment={m.hasAssessment}
                                  passMark={m.passMark}
                                  completion={done}
                                  onSuccess={close}
                                />
                              )}
                            </FormSheet>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Clear completion"
                              disabled={pending}
                              onClick={() => clear(m.id)}
                            >
                              <RotateCcw className="size-4 text-muted-foreground" />
                            </Button>
                          </>
                        ) : (
                          <FormSheet
                            title="Mark module complete"
                            description={m.title}
                            trigger={
                              <Button variant="outline" size="sm">
                                Mark done
                              </Button>
                            }
                          >
                            {({ close }) => (
                              <MarkModuleForm
                                moduleId={m.id}
                                staffId={staffId}
                                hasAssessment={m.hasAssessment}
                                passMark={m.passMark}
                                onSuccess={close}
                              />
                            )}
                          </FormSheet>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
