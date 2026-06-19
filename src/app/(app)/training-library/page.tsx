import { PageHeader } from "@/components/staffly/layout/PageHeader";
import { ProgrammeTable } from "@/components/staffly/training/ProgrammeTable";
import { getCurrentUser, can } from "@/lib/auth";
import { listProgrammes } from "@/lib/staffly/data/training";
import { listActiveRoles } from "@/lib/staffly/data/roles";

export const metadata = { title: "Training library" };

export default async function TrainingLibraryPage() {
  const [programmes, roles, user] = await Promise.all([
    listProgrammes(),
    listActiveRoles(),
    getCurrentUser(),
  ]);
  const canManage = can(user, "editContent");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Compliance"
        title="Training library"
        description="Your catalogue of training programmes and the roles that require them."
      />
      <ProgrammeTable
        programmes={programmes.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          category: p.category,
          requiredFor: p.requiredForRoles,
          isOneTime: p.isOneTime,
          refreshIntervalMonths: p.refreshIntervalMonths,
          active: p.active,
          records: p._count.trainingRecords,
        }))}
        roles={roles.map((r) => ({ id: r.id, name: r.name }))}
        canManage={canManage}
      />
    </div>
  );
}
