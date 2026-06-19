import { addDays } from "date-fns";
import { db } from "@/lib/db";
import { centerScope } from "@/lib/center-context";

// All steps (active + inactive) for the Settings manager.
export async function listOnboardingSteps() {
  return db.onboardingStep.findMany({
    orderBy: [{ sortOrder: "asc" }],
    include: {
      role: { select: { id: true, name: true } },
      _count: { select: { completions: true } },
    },
  });
}

export type OnboardingStepRow = Awaited<
  ReturnType<typeof listOnboardingSteps>
>[number];

// One staff member's onboarding checklist: the steps that apply to them
// (global + their role) with completion state and due dates from start date.
export async function getStaffOnboarding(staffId: string) {
  const staff = await db.staffMember.findUnique({
    where: { id: staffId },
    select: { startDate: true, roleId: true },
  });
  if (!staff) return null;

  const where = staff.roleId
    ? { active: true, OR: [{ roleId: null }, { roleId: staff.roleId }] }
    : { active: true, roleId: null };

  const steps = await db.onboardingStep.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }],
    include: { completions: { where: { staffId }, take: 1 } },
  });

  const now = new Date();
  const items = steps.map((s) => {
    const c = s.completions[0] ?? null;
    const dueDate =
      s.dueOffsetDays != null ? addDays(staff.startDate, s.dueOffsetDays) : null;
    return {
      id: s.id,
      title: s.title,
      description: s.description,
      category: s.category,
      dueDate,
      overdue: !c && dueDate != null && dueDate < now,
      completion: c
        ? { completedDate: c.completedDate, completedBy: c.completedBy, notes: c.notes }
        : null,
    };
  });

  return {
    startDate: staff.startDate,
    total: items.length,
    done: items.filter((i) => i.completion).length,
    overdue: items.filter((i) => i.overdue).length,
    items,
  };
}

export type StaffOnboarding = NonNullable<
  Awaited<ReturnType<typeof getStaffOnboarding>>
>;
export type OnboardingItem = StaffOnboarding["items"][number];

// Org-wide overview: staff still working through onboarding (have applicable
// steps and aren't fully complete), newest starters first.
export async function getOnboardingOverview(selectedId: string | null) {
  const steps = await db.onboardingStep.findMany({
    where: { active: true },
    select: { id: true, roleId: true, dueOffsetDays: true },
  });
  const staff = await db.staffMember.findMany({
    where: { ...centerScope(selectedId), status: { not: "INACTIVE" } },
    orderBy: [{ startDate: "desc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      startDate: true,
      roleId: true,
      status: true,
      role: { select: { name: true } },
      center: { select: { name: true } },
      onboarding: { select: { stepId: true } },
    },
  });

  const now = new Date();
  return staff
    .map((s) => {
      const applicable = steps.filter(
        (st) => st.roleId === null || st.roleId === s.roleId,
      );
      const done = new Set(s.onboarding.map((o) => o.stepId));
      const completed = applicable.filter((st) => done.has(st.id)).length;
      const overdue = applicable.filter(
        (st) =>
          !done.has(st.id) &&
          st.dueOffsetDays != null &&
          addDays(s.startDate, st.dueOffsetDays) < now,
      ).length;
      return {
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        roleName: s.role?.name ?? null,
        centerName: s.center.name,
        status: s.status,
        startDate: s.startDate,
        total: applicable.length,
        done: completed,
        overdue,
        complete: applicable.length > 0 && completed === applicable.length,
      };
    })
    .filter((r) => r.total > 0 && !r.complete)
    .sort((a, b) => b.overdue - a.overdue);
}

export type OnboardingOverviewRow = Awaited<
  ReturnType<typeof getOnboardingOverview>
>[number];
