import { notFound } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { StaffOnboarding } from "@/components/staffly/onboarding/StaffOnboarding";
import { getCurrentUser, can } from "@/lib/auth";
import { getStaffOnboarding } from "@/lib/staffly/data/onboarding";

export const metadata = { title: "Onboarding" };

export default async function OnboardingTabPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, user] = await Promise.all([
    getStaffOnboarding(id),
    getCurrentUser(),
  ]);
  if (!data) notFound();
  const canManage = can(user, "editContent");

  if (data.items.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No onboarding steps"
        description="No onboarding steps apply to this person yet. Admins can configure the new-starter journey in Settings → Onboarding steps."
      />
    );
  }

  return (
    <StaffOnboarding
      staffId={id}
      items={data.items}
      done={data.done}
      total={data.total}
      canManage={canManage}
    />
  );
}
