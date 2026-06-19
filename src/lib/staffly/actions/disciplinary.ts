"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { denyUnless } from "@/lib/auth";
import { fieldErrorsFromZod, type FormState } from "@/lib/form";
import { disciplinarySchema } from "@/lib/staffly/validation";
import { logAudit, staffDisplayName } from "@/lib/staffly/audit";

function revalidateDisc(staffId: string) {
  revalidatePath(`/staff/${staffId}/disciplinary`);
  revalidatePath(`/staff/${staffId}/overview`);
  revalidatePath(`/staff/${staffId}/timeline`);
  revalidatePath("/");
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
  const rec = await db.disciplinaryRecord.create({
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
  await logAudit({
    action: "disciplinary.created",
    entity: "DisciplinaryRecord",
    entityId: rec.id,
    staffId: d.staffId,
    summary: `Recorded ${d.stage.replace(/_/g, " ").toLowerCase()} for ${await staffDisplayName(d.staffId)}`,
  });
  revalidateDisc(d.staffId);
  redirect(`/staff/${d.staffId}/disciplinary`);
}

export async function setDisciplinaryStatus(id: string, status: string) {
  await denyUnless("editContent");
  const rec = await db.disciplinaryRecord.update({
    where: { id },
    data: { status: status as "OPEN" | "RESOLVED" | "APPEALED" },
    select: { staffId: true },
  });
  await logAudit({
    action: "disciplinary.status_changed",
    entity: "DisciplinaryRecord",
    entityId: id,
    staffId: rec.staffId,
    summary: `Marked a disciplinary record ${status.toLowerCase()} for ${await staffDisplayName(rec.staffId)}`,
  });
  revalidateDisc(rec.staffId);
}

export async function deleteDisciplinary(id: string) {
  await denyUnless("editContent");
  const rec = await db.disciplinaryRecord.delete({
    where: { id },
    select: { staffId: true },
  });
  await logAudit({
    action: "disciplinary.deleted",
    entity: "DisciplinaryRecord",
    entityId: id,
    staffId: rec.staffId,
    summary: `Deleted a disciplinary record for ${await staffDisplayName(rec.staffId)}`,
  });
  revalidateDisc(rec.staffId);
}
