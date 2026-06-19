import { OnboardingStepsManager } from "@/components/staffly/settings/OnboardingStepsManager";
import { getCurrentUser, can } from "@/lib/auth";
import { listRoles } from "@/lib/staffly/data/roles";
import { listOnboardingSteps } from "@/lib/staffly/data/onboarding";

export const metadata = { title: "Onboarding · Settings" };

export default async function OnboardingSettingsPage() {
  const [user, onboardingSteps, roles] = await Promise.all([
    getCurrentUser(),
    listOnboardingSteps(),
    listRoles(),
  ]);
  const canManage = can(user, "admin");
  const activeRoles = roles
    .filter((r) => r.active)
    .map((r) => ({ id: r.id, name: r.name }));

  return (
    <OnboardingStepsManager
      steps={onboardingSteps.map((s) => ({
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
      roles={activeRoles}
      canManage={canManage}
    />
  );
}
