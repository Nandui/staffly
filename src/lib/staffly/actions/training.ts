"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { denyUnless, getCurrentUser } from "@/lib/auth";
import { fieldErrorsFromZod, type FormState } from "@/lib/form";
import {
  trainingRecordSchema,
  trainingProgrammeSchema,
} from "@/lib/staffly/validation";
import { logAudit, staffDisplayName } from "@/lib/staffly/audit";

function revalidateTraining(staffId?: string) {
  if (staffId) {
    revalidatePath(`/staff/${staffId}/training`);
    revalidatePath(`/staff/${staffId}/overview`);
    revalidatePath(`/staff/${staffId}/timeline`);
  }
  revalidatePath("/training-matrix");
  revalidatePath("/training-library");
  revalidatePath("/");
}

export async function logTraining(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const denied = await denyUnless("editContent");
  if (denied) return denied;

  const parsed = trainingRecordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const d = parsed.data;
  const user = await getCurrentUser();
  const rec = await db.trainingRecord.create({
    data: {
      staffId: d.staffId,
      programmeId: d.programmeId ? d.programmeId : null,
      title: d.title,
      category: d.category,
      delivery: d.delivery,
      deliveredBy: d.deliveredBy,
      completedDate: new Date(d.completedDate),
      durationHours: d.durationHours,
      outcome: d.outcome,
      expiryDate: d.expiryDate ? new Date(d.expiryDate) : null,
      notes: d.notes ?? "",
      documentId: d.documentId ? d.documentId : null,
      recordedBy: user?.name ?? user?.email ?? "Unknown",
    },
  });
  await logAudit({
    action: "training.logged",
    entity: "TrainingRecord",
    entityId: rec.id,
    staffId: d.staffId,
    summary: `Logged training "${d.title}" for ${await staffDisplayName(d.staffId)}`,
  });
  revalidateTraining(d.staffId);
  return { ok: true };
}

export async function deleteTraining(id: string) {
  await denyUnless("editContent");
  const t = await db.trainingRecord.delete({
    where: { id },
    select: { staffId: true, title: true },
  });
  await logAudit({
    action: "training.deleted",
    entity: "TrainingRecord",
    entityId: id,
    staffId: t.staffId,
    summary: `Deleted training "${t.title}" for ${await staffDisplayName(t.staffId)}`,
  });
  revalidateTraining(t.staffId);
}

// ── Training programmes (library) ────────────────────────────────────────────

export async function createProgramme(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const denied = await denyUnless("editContent");
  if (denied) return denied;

  const raw = Object.fromEntries(formData);
  const parsed = trainingProgrammeSchema.safeParse({
    ...raw,
    requiredForRoleIds: formData.getAll("requiredForRoleIds"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const d = parsed.data;
  const prog = await db.trainingProgramme.create({
    data: {
      name: d.name,
      description: d.description ?? "",
      category: d.category,
      isOneTime: d.isOneTime,
      refreshIntervalMonths: d.isOneTime ? null : d.refreshIntervalMonths,
      active: d.active,
      requiredForRoles: { connect: d.requiredForRoleIds.map((id) => ({ id })) },
    },
  });
  await logAudit({
    action: "programme.created",
    entity: "TrainingProgramme",
    entityId: prog.id,
    summary: `Created training programme "${d.name}"`,
  });
  revalidateTraining();
  redirect("/training-library");
}

export async function updateProgramme(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const denied = await denyUnless("editContent");
  if (denied) return denied;

  const raw = Object.fromEntries(formData);
  const parsed = trainingProgrammeSchema.safeParse({
    ...raw,
    requiredForRoleIds: formData.getAll("requiredForRoleIds"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const d = parsed.data;
  await db.trainingProgramme.update({
    where: { id },
    data: {
      name: d.name,
      description: d.description ?? "",
      category: d.category,
      isOneTime: d.isOneTime,
      refreshIntervalMonths: d.isOneTime ? null : d.refreshIntervalMonths,
      active: d.active,
      requiredForRoles: { set: d.requiredForRoleIds.map((id) => ({ id })) },
    },
  });
  await logAudit({
    action: "programme.updated",
    entity: "TrainingProgramme",
    entityId: id,
    summary: `Updated training programme "${d.name}"`,
  });
  revalidateTraining();
  redirect("/training-library");
}

export async function setProgrammeActive(id: string, active: boolean) {
  await denyUnless("editContent");
  const prog = await db.trainingProgramme.update({
    where: { id },
    data: { active },
    select: { name: true },
  });
  await logAudit({
    action: active ? "programme.activated" : "programme.deactivated",
    entity: "TrainingProgramme",
    entityId: id,
    summary: `${active ? "Activated" : "Deactivated"} programme "${prog.name}"`,
  });
  revalidateTraining();
}
