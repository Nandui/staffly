"use client";

import * as React from "react";
import { UploadCloud, FileCheck2, ImageUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Styled file picker used by the document vault and cert photos. Renders a real
// <input type="file"> so it posts with the Server Action FormData. Set
// `multiple` to allow several files (e.g. cert photos).
export function FileUpload({
  accept = ".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx",
  maxMb = 5,
  name = "file",
  multiple = false,
  label,
}: {
  accept?: string;
  maxMb?: number;
  name?: string;
  multiple?: boolean;
  label?: string;
}) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const Icon = multiple ? ImageUp : UploadCloud;

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong bg-surface-2/50 px-4 py-8 text-center transition-colors hover:border-primary hover:bg-accent/40",
        )}
      >
        {files.length > 0 ? (
          <>
            <FileCheck2 className="size-7 text-cert-valid" />
            <p className="text-sm font-medium text-ink">
              {files.length === 1
                ? files[0].name
                : `${files.length} files selected`}
            </p>
            <p className="text-xs text-muted-foreground">click to change</p>
          </>
        ) : (
          <>
            <Icon className="size-7 text-muted-foreground" />
            <p className="text-sm font-medium text-ink">
              {label ?? (multiple ? "Click to choose files" : "Click to choose a file")}
            </p>
            <p className="text-xs text-muted-foreground">
              {multiple ? "Images" : "PDF, image or Word doc"} · up to {maxMb}MB each
            </p>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          const picked = Array.from(e.target.files ?? []);
          const tooBig = picked.find((f) => f.size > maxMb * 1024 * 1024);
          if (tooBig) {
            setError(`Each file must be ${maxMb}MB or smaller.`);
            setFiles([]);
            e.target.value = "";
            return;
          }
          setError(null);
          setFiles(picked);
        }}
      />
      {files.length > 1 && (
        <ul className="mt-2 space-y-1">
          {files.map((f) => (
            <li key={f.name} className="truncate text-xs text-muted-foreground">
              {f.name} · {(f.size / 1024).toFixed(0)} KB
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-1.5 text-xs font-medium text-critical">{error}</p>}
    </div>
  );
}
