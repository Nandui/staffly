"use client";

import { useTransition } from "react";
import { Plus, Pencil, Power, Lock } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormSheet } from "@/components/staffly/shared/FormSheet";
import { CertTypeForm } from "@/components/staffly/settings/CertTypeForm";
import { cn } from "@/lib/utils";
import {
  createCertType,
  updateCertType,
  setCertTypeActive,
} from "@/lib/staffly/actions/cert-types";

export interface CertTypeView {
  id: string;
  name: string;
  issuingBody: string;
  validityMonths: number;
  description: string;
  isBuiltIn: boolean;
  active: boolean;
  records: number;
  roles: number;
}

export function CertTypesManager({
  certTypes,
  canManage,
}: {
  certTypes: CertTypeView[];
  canManage: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Certification types</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Built-ins can be deactivated; custom types are fully editable.
          </p>
        </div>
        {canManage && (
          <FormSheet
            title="Add cert type"
            description="Create a custom certification type."
            trigger={
              <Button size="sm">
                <Plus className="size-4" /> Add cert type
              </Button>
            }
          >
            {({ close }) => (
              <CertTypeForm
                action={createCertType}
                submitLabel="Create cert type"
                onSuccess={close}
              />
            )}
          </FormSheet>
        )}
      </CardHeader>

      <ul className="divide-y divide-line">
        {certTypes.map((c) => (
          <li key={c.id} className="flex items-start justify-between gap-3 px-5 py-3.5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-ink">{c.name}</p>
                {c.isBuiltIn && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[0.7rem] font-medium text-muted-foreground">
                    <Lock className="size-2.5" /> Built-in
                  </span>
                )}
                {!c.active && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.7rem] font-medium text-slate-500">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {c.issuingBody} · valid {c.validityMonths} months · {c.records}{" "}
                records · required by {c.roles} role{c.roles === 1 ? "" : "s"}
              </p>
            </div>
            {canManage && (
              <div className="flex shrink-0 items-center gap-1">
                {!c.isBuiltIn && (
                  <FormSheet
                    title="Edit cert type"
                    trigger={
                      <Button variant="ghost" size="icon" aria-label="Edit">
                        <Pencil className="size-4 text-muted-foreground" />
                      </Button>
                    }
                  >
                    {({ close }) => (
                      <CertTypeForm
                        action={updateCertType.bind(null, c.id)}
                        certType={{
                          name: c.name,
                          issuingBody: c.issuingBody,
                          validityMonths: c.validityMonths,
                          description: c.description,
                        }}
                        submitLabel="Save changes"
                        onSuccess={close}
                      />
                    )}
                  </FormSheet>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={c.active ? "Deactivate" : "Activate"}
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      await setCertTypeActive(c.id, !c.active);
                      toast.success(c.active ? "Deactivated" : "Activated");
                    })
                  }
                >
                  <Power
                    className={cn(
                      "size-4",
                      c.active ? "text-cert-valid" : "text-muted-foreground",
                    )}
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
