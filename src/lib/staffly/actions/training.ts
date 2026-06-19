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

function revalidateTraining(staffId?: string) {
  if (staffId) {
    revalidatePath(`/staffly/staff/${staffId}/training`);
    revalidatePath(`/staffly/staff/${staffId}/overview`);
    revalidatePath(`/staffly/staff/${staffId}/timeline`);
  }
  revalidatePath("/staffly/training-matrix");
  revalidatePath("/staffly/training-library");
  revalidatePath("/staffly");
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
  await db.trainingRecord.create({
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
  revalidateTraining(d.staffId);
  return { ok: true };
}

export async function deleteTraining(id: string) {
  await denyUnless("editContent");
  const t = await db.trainingRecord.delete({
    where: { id },
    select: { staffId: true },
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
  await db.trainingProgramme.create({
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
  revalidateTraining();
  redirect("/staffly/training-library");
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
  revalidateTraining();
  redirect("/staffly/training-library");
}

export async function setProgrammeActive(id: string, active: boolean) {
  await denyUnless("editContent");
  await db.trainingProgramme.update({ where: { id }, data: { active } });
  revalidateTraining();
}
