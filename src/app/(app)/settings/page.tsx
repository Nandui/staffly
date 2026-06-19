import { CentresManager } from "@/components/staffly/settings/CentresManager";
import { getCurrentUser, can } from "@/lib/auth";
import { listCentresWithCounts } from "@/lib/staffly/data/centres";

export const metadata = { title: "Centres · Settings" };

export default async function CentresSettingsPage() {
  const [user, centres] = await Promise.all([
    getCurrentUser(),
    listCentresWithCounts(),
  ]);
  const canManage = can(user, "admin");

  return (
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
  );
}
