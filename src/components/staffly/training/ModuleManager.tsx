"use client";

import { useTransition } from "react";
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  Clock,
  ClipboardCheck,
  Users,
  ExternalLink,
  FileText,
  Paperclip,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FormSheet } from "@/components/staffly/shared/FormSheet";
import { ConfirmDialog } from "@/components/staffly/shared/ConfirmDialog";
import { ModuleForm } from "@/components/staffly/training/ModuleForm";
import { ModuleResourceForm } from "@/components/staffly/training/ModuleResourceForm";
import { cn } from "@/lib/utils";
import { formatMinutes } from "@/lib/staffly/utils";
import {
  createModule,
  updateModule,
  deleteModule,
  moveModule,
  deleteModuleResource,
} from "@/lib/staffly/actions/training-modules";

export interface ResourceView {
  id: string;
  kind: "LINK" | "FILE";
  label: string;
  url: string;
  filename: string | null;
}

export interface ModuleView {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number | null;
  hasAssessment: boolean;
  passMark: number | null;
  resources: ResourceView[];
  completions: number;
}

export function ModuleManager({
  programmeId,
  modules,
  canManage,
}: {
  programmeId: string;
  modules: ModuleView[];
  canManage: boolean;
}) {
  const [pending, startTransition] = useTransition();

  const move = (id: string, dir: "up" | "down") =>
    startTransition(async () => {
      await moveModule(id, dir);
    });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-semibold text-ink">Modules</h2>
          {modules.length > 0 && (
            <span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-xs font-semibold tnum text-muted-foreground">
              {modules.length}
            </span>
          )}
        </div>
        {canManage && (
          <FormSheet
            title="Add module"
            description="Break this programme into a learning module."
            trigger={
              <Button size="sm">
                <Plus className="size-4" /> Add module
              </Button>
            }
          >
            {({ close }) => (
              <ModuleForm
                action={createModule}
                programmeId={programmeId}
                submitLabel="Add module"
                onSuccess={close}
              />
            )}
          </FormSheet>
        )}
      </div>

      {modules.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No modules yet"
          description={
            canManage
              ? "Add modules to build out this programme's curriculum."
              : "This programme has no modules yet."
          }
        />
      ) : (
        <ol className="space-y-3">
          {modules.map((m, i) => (
            <li
              key={m.id}
              className="rounded-[var(--radius-card)] border border-line bg-surface shadow-xs"
            >
              <div className="flex items-start gap-3 p-4">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent font-mono text-sm font-semibold tnum text-accent-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium leading-snug text-ink">
                      {m.title}
                    </h3>
                    {canManage && (
                      <div className="flex shrink-0 items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Move up"
                          disabled={i === 0 || pending}
                          onClick={() => move(m.id, "up")}
                        >
                          <ArrowUp className="size-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Move down"
                          disabled={i === modules.length - 1 || pending}
                          onClick={() => move(m.id, "down")}
                        >
                          <ArrowDown className="size-4 text-muted-foreground" />
                        </Button>
                        <FormSheet
                          title="Edit module"
                          trigger={
                            <Button variant="ghost" size="icon" aria-label="Edit">
                              <Pencil className="size-4 text-muted-foreground" />
                            </Button>
                          }
                        >
                          {({ close }) => (
                            <ModuleForm
                              action={updateModule.bind(null, m.id)}
                              programmeId={programmeId}
                              module={{
                                title: m.title,
                                description: m.description,
                                estimatedMinutes: m.estimatedMinutes,
                                hasAssessment: m.hasAssessment,
                                passMark: m.passMark,
                              }}
                              submitLabel="Save changes"
                              onSuccess={close}
                            />
                          )}
                        </FormSheet>
                        <ConfirmDialog
                          title="Delete this module?"
                          description={`Remove "${m.title}" and its resources. Staff completion records for it will also be removed.`}
                          confirmLabel="Delete"
                          successMessage="Module deleted"
                          onConfirm={() => deleteModule(m.id)}
                          trigger={
                            <Button variant="ghost" size="icon" aria-label="Delete">
                              <Trash2 className="size-4 text-muted-foreground" />
                            </Button>
                          }
                        />
                      </div>
                    )}
                  </div>

                  {m.description && (
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                      {m.description}
                    </p>
                  )}

                  <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                    {m.estimatedMinutes ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {formatMinutes(m.estimatedMinutes)}
                      </span>
                    ) : null}
                    {m.hasAssessment && (
                      <span className="inline-flex items-center gap-1 text-ink-soft">
                        <ClipboardCheck className="size-3.5" />
                        {m.passMark != null
                          ? `Assessment · ${m.passMark}% to pass`
                          : "Assessment"}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Users className="size-3.5" />
                      {m.completions} completed
                    </span>
                  </div>

                  {(m.resources.length > 0 || canManage) && (
                    <div className="mt-3 space-y-1.5 border-t border-line pt-3">
                      {m.resources.map((r) => (
                        <div key={r.id} className="flex items-center gap-2">
                          {r.kind === "FILE" ? (
                            <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                          ) : (
                            <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
                          )}
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate text-sm text-primary hover:underline"
                          >
                            {r.label}
                          </a>
                          {canManage && (
                            <ConfirmDialog
                              title="Remove this resource?"
                              confirmLabel="Remove"
                              successMessage="Resource removed"
                              onConfirm={() => deleteModuleResource(r.id)}
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label="Remove resource"
                                  className="ml-auto size-7"
                                >
                                  <Trash2 className="size-3.5 text-muted-foreground" />
                                </Button>
                              }
                            />
                          )}
                        </div>
                      ))}
                      {canManage && (
                        <FormSheet
                          title="Add resource"
                          description="Attach a link or upload a file for this module."
                          trigger={
                            <button
                              type="button"
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                            >
                              <Paperclip className="size-3.5" /> Add resource
                            </button>
                          }
                        >
                          {({ close }) => (
                            <ModuleResourceForm moduleId={m.id} onSuccess={close} />
                          )}
                        </FormSheet>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

      {pending && (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          Reordering…
        </p>
      )}
    </div>
  );
}
