"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { denyUnless, getCurrentUser } from "@/lib/auth";
import { fieldErrorsFromZod, type FormState } from "@/lib/form";
import { onboardingStepSchema } from "@/lib/staffly/validation";
import { logAudit, staffDisplayName } from "@/lib/staffly/audit";

async function actorName() {
  const user = await getCurrentUser();
  return user?.name ?? user?.email ?? "Unknown";
}

function revalidateTemplate() {
  revalidatePath("/settings");
  revalidatePath("/onboarding");
}

function revalidateStaffOnboarding(staffId: string) {
  revalidatePath(`/staff/${staffId}/onboarding`);
  revalidatePath(`/staff/${staffId}/overview`);
  revalidatePath(`/staff/${staffId}/timeline`);
  revalidatePath("/onboarding");
}

// ── Step template (Settings) ─────────────────────────────────────────────────

export async function createStep(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const denied = await denyUnless("admin");
  if (denied) return denied;

  const parsed = onboardingStepSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const d = parsed.data;
  const agg = await db.onboardingStep.aggregate({ _max: { sortOrder: true } });
  const step = await db.onboardingStep.create({
    data: {
      title: d.title,
      description: d.description ?? "",
      category: d.category,
      roleId: d.roleId ? d.roleId : null,
      dueOffsetDays: d.dueOffsetDays,
      active: d.active,
      sortOrder: (agg._max.sortOrder ?? 0) + 1,
    },
  });
  await logAudit({
    action: "onboarding.step_created",
    entity: "OnboardingStep",
    entityId: step.id,
    summary: `Added onboarding step "${d.title}"`,
  });
  revalidateTemplate();
  return { ok: true };
}

export async function updateStep(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const denied = await denyUnless("admin");
  if (denied) return denied;

  const parsed = onboardingStepSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const d = parsed.data;
  await db.onboardingStep.update({
    where: { id },
    data: {
      title: d.title,
      description: d.description ?? "",
      category: d.category,
      roleId: d.roleId ? d.roleId : null,
      dueOffsetDays: d.dueOffsetDays,
      active: d.active,
    },
  });
  await logAudit({
    action: "onboarding.step_updated",
    entity: "OnboardingStep",
    entityId: id,
    summary: `Updated onboarding step "${d.title}"`,
  });
  revalidateTemplate();
  return { ok: true };
}

export async function deleteStep(id: string) {
  await denyUnless("admin");
  const step = await db.onboardingStep.findUnique({
    where: { id },
    select: { title: true },
  });
  if (!step) return;
  await db.onboardingStep.delete({ where: { id } });
  await logAudit({
    action: "onboarding.step_deleted",
    entity: "OnboardingStep",
    entityId: id,
    summary: `Deleted onboarding step "${step.title}"`,
  });
  revalidateTemplate();
}

export async function setStepActive(id: string, active: boolean) {
  await denyUnless("admin");
  await db.onboardingStep.update({ where: { id }, data: { active } });
  revalidateTemplate();
}

export async function moveStep(id: string, dir: "up" | "down") {
  await denyUnless("admin");
  const step = await db.onboardingStep.findUnique({
    where: { id },
    select: { id: true, sortOrder: true },
  });
  if (!step) return;
  const neighbor = await db.onboardingStep.findFirst({
    where: { sortOrder: dir === "up" ? { lt: step.sortOrder } : { gt: step.sortOrder } },
    orderBy: { sortOrder: dir === "up" ? "desc" : "asc" },
    select: { id: true, sortOrder: true },
  });
  if (!neighbor) return;
  await db.$transaction([
    db.onboardingStep.update({
      where: { id: step.id },
      data: { sortOrder: neighbor.sortOrder },
    }),
    db.onboardingStep.update({
      where: { id: neighbor.id },
      data: { sortOrder: step.sortOrder },
    }),
  ]);
  revalidateTemplate();
}

// ── Per-staff completion ─────────────────────────────────────────────────────

export async function markOnboardingStep(stepId: string, staffId: string) {
  const denied = await denyUnless("editContent");
  if (denied) return;
  const step = await db.onboardingStep.findUnique({
    where: { id: stepId },
    select: { title: true },
  });
  const actor = await actorName();
  await db.onboardingCompletion.upsert({
    where: { stepId_staffId: { stepId, staffId } },
    create: {
      stepId,
      staffId,
      completedDate: new Date(),
      completedBy: actor,
    },
    update: {},
  });
  await logAudit({
    action: "onboarding.completed",
    entity: "OnboardingCompletion",
    staffId,
    summary: `Completed onboarding step "${step?.title ?? ""}" for ${await staffDisplayName(staffId)}`,
  });
  revalidateStaffOnboarding(staffId);
}

export async function clearOnboardingStep(stepId: string, staffId: string) {
  await denyUnless("editContent");
  await db.onboardingCompletion.deleteMany({ where: { stepId, staffId } });
  revalidateStaffOnboarding(staffId);
}
