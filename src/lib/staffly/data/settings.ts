import { db } from "@/lib/db";

// Entity counts for the Settings tab badges.
export async function getSettingsCounts() {
  const [centres, roles, certTypes, onboardingSteps] = await Promise.all([
    db.center.count(),
    db.staffRole.count(),
    db.certType.count(),
    db.onboardingStep.count(),
  ]);
  return { centres, roles, certTypes, onboardingSteps };
}
