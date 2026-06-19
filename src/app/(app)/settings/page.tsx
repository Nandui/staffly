import { PageHeader } from "@/components/staffly/layout/PageHeader";
import { CentresManager } from "@/components/staffly/settings/CentresManager";
import { RolesManager } from "@/components/staffly/settings/RolesManager";
import { CertTypesManager } from "@/components/staffly/settings/CertTypesManager";
import { getCurrentUser, can } from "@/lib/auth";
import { listCentresWithCounts } from "@/lib/staffly/data/centres";
import { listRoles } from "@/lib/staffly/data/roles";
import { listCertTypes, listActiveCertTypes } from "@/lib/staffly/data/cert-types";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [user, centres, roles, certTypes, activeCertTypes] = await Promise.all([
    getCurrentUser(),
    listCentresWithCounts(),
    listRoles(),
    listCertTypes(),
    listActiveCertTypes(),
  ]);
  const canManage = can(user, "admin");
  const activeCentres = centres
    .filter((c) => c.isActive)
    .map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System"
        title="Settings"
        description="Manage your centres, roles and certification types."
      />

      {!canManage && (
        <div className="rounded-lg border border-cert-expiring-line bg-cert-expiring-bg px-4 py-3 text-sm text-cert-expiring">
          You have read-only access. Administrators can manage these settings.
        </div>
      )}

      <CentresManager
        centres={centres.map((c) => ({
          id: c.id,
          name: c.name,
          address: c.address,
          contactName: c.contactName,
          contactEmail: c.contactEmail,
          phone: c.phone,
          notes: c.notes,
          isActive: c.isActive,
          staffCount: c._count.staff,
        }))}
        canManage={canManage}
      />

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
        centers={activeCentres}
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
