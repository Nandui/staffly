"use client";

import * as React from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";

// Destructive-action confirm (Radix AlertDialog). `onConfirm` is typically a
// server action; we run it in a transition and surface a toast on success.
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  successMessage,
  destructive = true,
  onConfirm,
}: {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  confirmLabel?: string;
  successMessage?: string;
  destructive?: boolean;
  onConfirm: () => Promise<unknown> | void;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              destructive && buttonClasses({ variant: "danger" }),
            )}
            disabled={pending}
            onClick={(e) => {
              e.preventDefault();
              startTransition(async () => {
                try {
                  await onConfirm();
                  if (successMessage) toast.success(successMessage);
                  setOpen(false);
                } catch {
                  toast.error("Something went wrong. Please try again.");
                }
              });
            }}
          >
            {pending ? "Working…" : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
