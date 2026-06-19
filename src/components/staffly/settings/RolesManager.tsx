"use client";

import { useTransition } from "react";
import { Plus, Pencil, Power } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormSheet } from "@/components/staffly/shared/FormSheet";
import { RoleForm } from "@/components/staffly/settings/RoleForm";
import { cn } from "@/lib/utils";
import { createRole, updateRole, setRoleActive } from "@/lib/staffly/actions/roles";

export interface RoleView {
  id: string;
  name: string;
  centerId: string | null;
  centerName: string | null;
  active: boolean;
  requiredCertTypes: { id: string; name: string }[];
  staffCount: number;
}

export function RolesManager({
  roles,
  centers,
  certTypes,
  canManage,
}: {
  roles: RoleView[];
  centers: { id: string; name: string }[];
  certTypes: { id: string; name: string }[];
  canManage: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Roles</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Map roles to the certifications they require.
          </p>
        </div>
        {canManage && (
          <FormSheet
            title="Add role"
            description="Define a role and its required certifications."
            trigger={
              <Button size="sm">
                <Plus className="size-4" /> Add role
              </Button>
            }
          >
            {({ close }) => (
              <RoleForm
                action={createRole}
                centers={centers}
                certTypes={certTypes}
                submitLabel="Create role"
                onSuccess={close}
              />
            )}
          </FormSheet>
        )}
      </CardHeader>

      <ul className="divide-y divide-line">
        {roles.length === 0 && (
          <li className="px-5 py-8 text-center text-sm text-muted-foreground">
            No roles yet.
          </li>
        )}
        {roles.map((r) => (
          <li key={r.id} className="flex items-start justify-between gap-3 px-5 py-3.5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-ink">{r.name}</p>
                {!r.active && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.7rem] font-medium text-slate-500">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {r.centerName ?? "Organisation-wide"} · {r.staffCount} staff
              </p>
              {r.requiredCertTypes.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {r.requiredCertTypes.map((c) => (
                    <span
                      key={c.id}
                      className="inline-flex rounded-full bg-accent px-2 py-0.5 text-[0.7rem] font-medium text-accent-foreground"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {canManage && (
              <div className="flex shrink-0 items-center gap-1">
                <FormSheet
                  title="Edit role"
                  trigger={
                    <Button variant="ghost" size="icon" aria-label="Edit role">
                      <Pencil className="size-4 text-muted-foreground" />
                    </Button>
                  }
                >
                  {({ close }) => (
                    <RoleForm
                      action={updateRole.bind(null, r.id)}
                      centers={centers}
                      certTypes={certTypes}
                      role={{
                        name: r.name,
                        centerId: r.centerId,
                        active: r.active,
                        requiredCertTypeIds: r.requiredCertTypes.map((c) => c.id),
                      }}
                      submitLabel="Save changes"
                      onSuccess={close}
                    />
                  )}
                </FormSheet>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={r.active ? "Deactivate" : "Activate"}
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      await setRoleActive(r.id, !r.active);
                      toast.success(r.active ? "Role deactivated" : "Role activated");
                    })
                  }
                >
                  <Power
                    className={cn(
                      "size-4",
                      r.active ? "text-cert-valid" : "text-muted-foreground",
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
