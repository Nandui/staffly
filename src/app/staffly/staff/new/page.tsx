import { PageHeader } from "@/components/staffly/layout/PageHeader";
import { StaffForm } from "@/components/staffly/staff/StaffForm";
import { Card } from "@/components/ui/card";
import { requireCapability } from "@/lib/auth";
import { getCenterContext } from "@/lib/center-context";
import { listActiveRoles } from "@/lib/staffly/data/roles";
import { createStaff } from "@/lib/staffly/actions/staff";

export const metadata = { title: "Add staff" };

export default async function NewStaffPage() {
  await requireCapability("editContent");
  const [{ centers }, roles] = await Promise.all([
    getCenterContext(),
    listActiveRoles(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Staff directory"
        title="Add a staff member"
        description="Create a profile, then add their certifications, training and absence history."
      />
      <Card className="p-6">
        <StaffForm
          action={createStaff}
          centers={centers}
          roles={roles.map((r) => ({ id: r.id, name: r.name }))}
          submitLabel="Create staff member"
        />
      </Card>
    </div>
  );
}
