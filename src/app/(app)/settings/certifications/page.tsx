import { CertTypesManager } from "@/components/staffly/settings/CertTypesManager";
import { getCurrentUser, can } from "@/lib/auth";
import { listCertTypes } from "@/lib/staffly/data/cert-types";

export const metadata = { title: "Certifications · Settings" };

export default async function CertificationsSettingsPage() {
  const [user, certTypes] = await Promise.all([
    getCurrentUser(),
    listCertTypes(),
  ]);
  const canManage = can(user, "admin");

  return (
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
  );
}
