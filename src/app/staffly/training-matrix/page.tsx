import { PageHeader } from "@/components/staffly/layout/PageHeader";
import { TrainingMatrix } from "@/components/staffly/training/TrainingMatrix";
import { getCenterContext } from "@/lib/center-context";
import { getTrainingMatrix } from "@/lib/staffly/data/training";
import { listActiveRoles } from "@/lib/staffly/data/roles";

export const metadata = { title: "Training matrix" };

export default async function TrainingMatrixPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const { selected, selectedId } = await getCenterContext();
  const [matrix, roles] = await Promise.all([
    getTrainingMatrix(selectedId, role || null),
    listActiveRoles(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={selected ? selected.name : "All centres"}
        title="Training matrix"
        description="Compliance at a glance — required certifications and training programmes by staff member."
      />
      <TrainingMatrix
        matrix={matrix}
        roles={roles.map((r) => ({ id: r.id, name: r.name }))}
        currentRoleId={role ?? ""}
      />
    </div>
  );
}
