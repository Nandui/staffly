"use client";

import * as React from "react";
import { useActionState } from "react";
import { Link2, Upload } from "lucide-react";
import { Field, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SheetBody, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { FileUpload } from "@/components/staffly/shared/FileUpload";
import { useSheetSuccess } from "@/components/staffly/shared/FormSheet";
import { addModuleResource } from "@/lib/staffly/actions/training-modules";
import { cn } from "@/lib/utils";
import type { FormState } from "@/lib/form";

export function ModuleResourceForm({
  moduleId,
  onSuccess,
}: {
  moduleId: string;
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    addModuleResource,
    null,
  );
  useSheetSuccess(state?.ok, "Resource added", onSuccess);
  const fe = state?.fieldErrors ?? {};
  const [tab, setTab] = React.useState<"link" | "file">("link");

  return (
    <form action={formAction} className="flex min-h-0 flex-1 flex-col">
      <input type="hidden" name="moduleId" value={moduleId} />
      <SheetBody className="space-y-4">
        {state?.error && (
          <div className="rounded-lg border border-critical-line bg-critical-bg px-3 py-2 text-sm font-medium text-critical">
            {state.error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 rounded-lg bg-surface-2 p-1">
          <button
            type="button"
            onClick={() => setTab("link")}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition-colors",
              tab === "link"
                ? "bg-surface text-ink shadow-xs"
                : "text-muted-foreground",
            )}
          >
            <Link2 className="size-4" /> Link
          </button>
          <button
            type="button"
            onClick={() => setTab("file")}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition-colors",
              tab === "file"
                ? "bg-surface text-ink shadow-xs"
                : "text-muted-foreground",
            )}
          >
            <Upload className="size-4" /> Upload file
          </button>
        </div>

        <Field label="Label" htmlFor="label" required error={fe.label}>
          <Input
            id="label"
            name="label"
            autoFocus
            placeholder={tab === "link" ? "e.g. Online course" : "e.g. Slides (PDF)"}
          />
        </Field>

        {tab === "link" ? (
          <Field label="URL" htmlFor="url" required error={fe.url}>
            <Input id="url" name="url" type="url" placeholder="https://…" />
          </Field>
        ) : (
          <Field label="File" hint="PDF, slides, image or document — up to 10MB.">
            <FileUpload
              name="file"
              maxMb={10}
              accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.ppt,.pptx"
            />
          </Field>
        )}
      </SheetBody>
      <SheetFooter>
        <Button type="submit" disabled={pending}>
          {pending ? "Adding…" : "Add resource"}
        </Button>
        <SheetClose asChild>
          <Button variant="ghost" type="button">
            Cancel
          </Button>
        </SheetClose>
      </SheetFooter>
    </form>
  );
}
