import { CentresManager } from "@/components/staffly/settings/CentresManager";
import { RolesManager } from "@/components/staffly/settings/RolesManager";
import { getCurrentUser, can } from "@/lib/auth";
import { listCentresWithCounts } from "@/lib/staffly/data/centres";
import { listRoles } from "@/lib/staffly/data/roles";
import { listActiveCertTypes } from "@/lib/staffly/data/cert-types";

export const metadata = { title: "Organisation · Settings" };

export default async function OrganisationSettingsPage() {
  const [user, centres, roles, activeCertTypes] = await Promise.all([
    getCurrentUser(),
    listCentresWithCounts(),
    listRoles(),
    listActiveCertTypes(),
  ]);
  const canManage = can(user, "admin");
  const activeCentres = centres
    .filter((c) => c.isActive)
    .map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-6">
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
    </div>
  );
}
