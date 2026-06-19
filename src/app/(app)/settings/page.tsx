import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/staffly/layout/PageHeader";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { RolesManager } from "@/components/staffly/settings/RolesManager";
import { CertTypesManager } from "@/components/staffly/settings/CertTypesManager";
import { getCurrentUser, can } from "@/lib/auth";
import { getCenterContext } from "@/lib/center-context";
import { listRoles } from "@/lib/staffly/data/roles";
import { listCertTypes, listActiveCertTypes } from "@/lib/staffly/data/cert-types";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [user, { centers }, roles, certTypes, activeCertTypes] =
    await Promise.all([
      getCurrentUser(),
      getCenterContext(),
      listRoles(),
      listCertTypes(),
      listActiveCertTypes(),
    ]);
  const canManage = can(user, "admin");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System"
        title="Settings"
        description="Manage roles, certification types and review your centres."
      />

      {!canManage && (
        <div className="rounded-lg border border-cert-expiring-line bg-cert-expiring-bg px-4 py-3 text-sm text-cert-expiring">
          You have read-only access. Administrators can manage these settings.
        </div>
      )}

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Centres</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Shared with Riskly — managed in the Centrely admin, not Staffly.
            </p>
          </div>
        </CardHeader>
        <ul className="divide-y divide-line">
          {centers.map((c) => (
            <li key={c.id} className="flex items-center gap-2.5 px-5 py-3">
              <span className="flex size-8 items-center justify-center rounded-lg bg-surface-2 text-muted-foreground">
                <Building2 className="size-4" />
              </span>
              <span className="text-sm font-medium text-ink">{c.name}</span>
            </li>
          ))}
        </ul>
      </Card>

      <RolesManager
        roles={roles.map((r) => ({
          id: r.id,
          name: r.name,
          centerId: r.centerId,
          centerName: r.center?.name ?? null,
          active: r.active,
          requiredCertTypes: r.requiredCertTypes,
          staffCount: r._count.staff,
        }))}
        centers={centers}
        certTypes={activeCertTypes.map((c) => ({ id: c.id, name: c.name }))}
        canManage={canManage}
      />

      <CertTypesManager
        certTypes={certTypes.map((c) => ({
          id: c.id,
          name: c.name,
          issuingBody: c.issuingBody,
          validityMonths: c.validityMonths,
          description: c.description,
          isBuiltIn: c.isBuiltIn,
          active: c.active,
          records: c._count.certRecords,
          roles: c._count.requiredByRoles,
        }))}
        canManage={canManage}
      />
    </div>
  );
}
