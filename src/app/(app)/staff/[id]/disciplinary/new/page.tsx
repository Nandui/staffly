import { notFound } from "next/navigation";
import { PageHeader } from "@/components/staffly/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { DisciplinaryForm } from "@/components/staffly/disciplinary/DisciplinaryForm";
import { requireCapability } from "@/lib/auth";
import { getStaffProfile } from "@/lib/staffly/data/staff";
import { staffName } from "@/lib/staffly/utils";

export const metadata = { title: "New disciplinary" };

export default async function NewDisciplinaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireCapability("editContent");
  const staff = await getStaffProfile(id);
  if (!staff) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={staffName(staff)}
        title="Record a disciplinary matter"
        description="A formal record. Stage, dates, description and outcome are all retained."
      />
      <Card className="p-6">
        <DisciplinaryForm
          staffId={id}
          cancelHref={`/staff/${id}/disciplinary`}
        />
      </Card>
    </div>
  );
}
