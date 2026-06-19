"use client";

import { useTransition } from "react";
import { Plus, Pencil, Power, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormSheet } from "@/components/staffly/shared/FormSheet";
import { CentreForm } from "@/components/staffly/settings/CentreForm";
import { cn } from "@/lib/utils";
import {
  createCentre,
  updateCentre,
  setCentreActive,
} from "@/lib/staffly/actions/centres";

export interface CentreView {
  id: string;
  name: string;
  address: string | null;
  contactName: string | null;
  contactEmail: string | null;
  phone: string | null;
  notes: string | null;
  isActive: boolean;
  staffCount: number;
}

export function CentresManager({
  centres,
  canManage,
}: {
  centres: CentreView[];
  canManage: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Centres</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Your leisure centres — the top-level scope for staff.
          </p>
        </div>
        {canManage && (
          <FormSheet
            title="Add centre"
            description="Create a centre staff can be assigned to."
            trigger={
              <Button size="sm">
                <Plus className="size-4" /> Add centre
              </Button>
            }
          >
            {({ close }) => (
              <CentreForm action={createCentre} submitLabel="Create centre" onSuccess={close} />
            )}
          </FormSheet>
        )}
      </CardHeader>

      <ul className="divide-y divide-line">
        {centres.length === 0 && (
          <li className="px-5 py-8 text-center text-sm text-muted-foreground">
            No centres yet. Add your first to start assigning staff.
          </li>
        )}
        {centres.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted-foreground">
                <Building2 className="size-4" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-ink">{c.name}</p>
                  {!c.isActive && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.7rem] font-medium text-slate-500">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {c.address ?? "No address"} · {c.staffCount} staff
                </p>
              </div>
            </div>
            {canManage && (
              <div className="flex shrink-0 items-center gap-1">
                <FormSheet
                  title="Edit centre"
                  trigger={
                    <Button variant="ghost" size="icon" aria-label="Edit centre">
                      <Pencil className="size-4 text-muted-foreground" />
                    </Button>
                  }
                >
                  {({ close }) => (
                    <CentreForm
                      action={updateCentre.bind(null, c.id)}
                      centre={{
                        name: c.name,
                        address: c.address,
                        contactName: c.contactName,
                        contactEmail: c.contactEmail,
                        phone: c.phone,
                        notes: c.notes,
                        active: c.isActive,
                      }}
                      submitLabel="Save changes"
                      onSuccess={close}
                    />
                  )}
                </FormSheet>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={c.isActive ? "Deactivate" : "Activate"}
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      await setCentreActive(c.id, !c.isActive);
                      toast.success(c.isActive ? "Centre deactivated" : "Centre activated");
                    })
                  }
                >
                  <Power
                    className={cn("size-4", c.isActive ? "text-cert-valid" : "text-muted-foreground")}
                  />
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
