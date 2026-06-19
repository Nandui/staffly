"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

// Slide-over wrapper. Radix unmounts the content on close, so the inner form's
// useActionState resets between opens. Children get a `close()` to call on
// success.
export function FormSheet({
  trigger,
  title,
  description,
  side = "right",
  children,
}: {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  side?: "right" | "left";
  children: (api: { close: () => void }) => React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        {children({ close: () => setOpen(false) })}
      </SheetContent>
    </Sheet>
  );
}

// Shared effect: when a FormState resolves ok, toast + close the sheet.
export function useSheetSuccess(
  ok: boolean | undefined,
  message: string,
  onSuccess: () => void,
) {
  const handled = React.useRef(false);
  React.useEffect(() => {
    if (ok && !handled.current) {
      handled.current = true;
      toast.success(message);
      onSuccess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ok]);
}
