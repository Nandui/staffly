import { PageHeader } from "@/components/staffly/layout/PageHeader";
import { SettingsView } from "@/components/staffly/settings/SettingsView";
import { getCurrentUser, can } from "@/lib/auth";
import { listCentresWithCounts } from "@/lib/staffly/data/centres";
import { listRoles } from "@/lib/staffly/data/roles";
import { listCertTypes, listActiveCertTypes } from "@/lib/staffly/data/cert-types";
import { listOnboardingSteps } from "@/lib/staffly/data/onboarding";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [user, centres, roles, certTypes, activeCertTypes, onboardingSteps] =
    await Promise.all([
      getCurrentUser(),
      listCentresWithCounts(),
      listRoles(),
      listCertTypes(),
      listActiveCertTypes(),
      listOnboardingSteps(),
    ]);
  const canManage = can(user, "admin");
  const activeCentres = centres
    .filter((c) => c.isActive)
    .map((c) => ({ id: c.id, name: c.name }));
  const activeRoles = roles
    .filter((r) => r.active)
    .map((r) => ({ id: r.id, name: r.name }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System"
        title="Settings"
        description="Configure the organisation, compliance catalogue and the new-starter journey."
      />

      {!canManage && (
        <div className="rounded-lg border border-line bg-surface-2 px-4 py-3 text-sm text-muted-foreground">
          You have read-only access. Administrators can manage these settings.
        </div>
      )}

      <SettingsView
        canManage={canManage}
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
        roles={roles.map((r) => ({
          id: r.id,
          name: r.name,
          centerId: r.centerId,
          centerName: r.center?.name ?? null,
          active: r.active,
          requiredCertTypes: r.requiredCertTypes,
          staffCount: r._count.staff,
        }))}
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
        onboardingSteps={onboardingSteps.map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          category: s.category,
          roleId: s.roleId,
          roleName: s.role?.name ?? null,
          dueOffsetDays: s.dueOffsetDays,
          active: s.active,
          completions: s._count.completions,
        }))}
        centerOptions={activeCentres}
        certTypeOptions={activeCertTypes.map((c) => ({ id: c.id, name: c.name }))}
        roleOptions={activeRoles}
      />
    </div>
  );
}
