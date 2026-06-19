"use client";

import * as React from "react";
import { UploadCloud, FileCheck2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Styled file picker used in the document vault upload sheet. Renders a real
// <input type="file" name="file"> so it posts with the Server Action FormData.
export function FileUpload({
  accept = ".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx",
  maxMb = 5,
  name = "file",
}: {
  accept?: string;
  maxMb?: number;
  name?: string;
}) {
  const [file, setFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong bg-surface-2/50 px-4 py-8 text-center transition-colors hover:border-primary hover:bg-accent/40",
        )}
      >
        {file ? (
          <>
            <FileCheck2 className="size-7 text-cert-valid" />
            <p className="text-sm font-medium text-ink">{file.name}</p>
            <p className="text-xs text-muted-foreground tnum">
              {(file.size / 1024).toFixed(0)} KB · click to replace
            </p>
          </>
        ) : (
          <>
            <UploadCloud className="size-7 text-muted-foreground" />
            <p className="text-sm font-medium text-ink">Click to choose a file</p>
            <p className="text-xs text-muted-foreground">
              PDF, image or Word doc · up to {maxMb}MB
            </p>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          if (f && f.size > maxMb * 1024 * 1024) {
            setError(`File must be ${maxMb}MB or smaller.`);
            setFile(null);
            e.target.value = "";
            return;
          }
          setError(null);
          setFile(f);
        }}
      />
      {error && (
        <p className="mt-1.5 text-xs font-medium text-critical">{error}</p>
      )}
    </div>
  );
}
