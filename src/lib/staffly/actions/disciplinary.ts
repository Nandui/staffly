"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { denyUnless } from "@/lib/auth";
import { fieldErrorsFromZod, type FormState } from "@/lib/form";
import { disciplinarySchema } from "@/lib/staffly/validation";

function revalidateDisc(staffId: string) {
  revalidatePath(`/staffly/staff/${staffId}/disciplinary`);
  revalidatePath(`/staffly/staff/${staffId}/overview`);
  revalidatePath(`/staffly/staff/${staffId}/timeline`);
  revalidatePath("/staffly");
}

export async function createDisciplinary(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const denied = await denyUnless("editContent");
  if (denied) return denied;

  const parsed = disciplinarySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const d = parsed.data;
  await db.disciplinaryRecord.create({
    data: {
      staffId: d.staffId,
      stage: d.stage,
      status: d.status,
      meetingDate: new Date(d.meetingDate),
      incidentDate: new Date(d.incidentDate),
      reviewDate: d.reviewDate ? new Date(d.reviewDate) : null,
      description: d.description,
      outcome: d.outcome,
      managedBy: d.managedBy,
      witnessPresent: d.witnessPresent,
      witnessName: d.witnessName ? d.witnessName : null,
      staffAcknowledged: d.staffAcknowledged,
    },
  });
  revalidateDisc(d.staffId);
  redirect(`/staffly/staff/${d.staffId}/disciplinary`);
}

export async function setDisciplinaryStatus(id: string, status: string) {
  await denyUnless("editContent");
  const rec = await db.disciplinaryRecord.update({
    where: { id },
    data: { status: status as "OPEN" | "RESOLVED" | "APPEALED" },
    select: { staffId: true },
  });
  revalidateDisc(rec.staffId);
}

export async function deleteDisciplinary(id: string) {
  await denyUnless("editContent");
  const rec = await db.disciplinaryRecord.delete({
    where: { id },
    select: { staffId: true },
  });
  revalidateDisc(rec.staffId);
}
