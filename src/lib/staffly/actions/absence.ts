"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { denyUnless } from "@/lib/auth";
import { fieldErrorsFromZod, type FormState } from "@/lib/form";
import { addAbsenceSchema, rtwSchema } from "@/lib/staffly/validation";

function revalidateAbsence(staffId: string) {
  revalidatePath(`/staff/${staffId}/absence`);
  revalidatePath(`/staff/${staffId}/overview`);
  revalidatePath(`/staff/${staffId}/timeline`);
  revalidatePath("/absence");
  revalidatePath("/");
}

export async function addAbsence(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const denied = await denyUnless("editContent");
  if (denied) return denied;

  const parsed = addAbsenceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const d = parsed.data;
  await db.absenceRecord.create({
    data: {
      staffId: d.staffId,
      type: d.type,
      startDate: new Date(d.startDate),
      endDate: new Date(d.endDate),
      daysCount: d.daysCount,
      reason: d.reason ?? "",
      certProvided: d.certProvided,
      approvedBy: d.approvedBy,
    },
  });
  revalidateAbsence(d.staffId);
  return { ok: true };
}

export async function completeRtw(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const denied = await denyUnless("editContent");
  if (denied) return denied;

  const parsed = rtwSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const d = parsed.data;
  const note = [
    `Conducted by ${d.conductedBy}.`,
    d.account ? `Account: ${d.account}` : "",
    d.furtherAction ? `Further action: ${d.furtherAction}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const absence = await db.absenceRecord.update({
    where: { id: d.absenceId },
    data: { returnToWorkNote: note, returnToWorkCompletedAt: new Date(d.rtwDate) },
    select: { staffId: true },
  });
  revalidateAbsence(absence.staffId);
  return { ok: true };
}

export async function deleteAbsence(id: string) {
  await denyUnless("editContent");
  const a = await db.absenceRecord.delete({
    where: { id },
    select: { staffId: true },
  });
  revalidateAbsence(a.staffId);
}
