"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { denyUnless, getCurrentUser } from "@/lib/auth";
import { fieldErrorsFromZod, type FormState } from "@/lib/form";
import { addCertRecordSchema } from "@/lib/staffly/validation";

function revalidateCerts(staffId: string) {
  revalidatePath(`/staffly/staff/${staffId}/certifications`);
  revalidatePath(`/staffly/staff/${staffId}/overview`);
  revalidatePath(`/staffly/staff/${staffId}/timeline`);
  revalidatePath("/staffly/certifications");
  revalidatePath("/staffly/training-matrix");
  revalidatePath("/staffly/notifications");
  revalidatePath("/staffly", "layout");
}

export async function addCertRecord(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const denied = await denyUnless("editContent");
  if (denied) return denied;

  const parsed = addCertRecordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const d = parsed.data;
  const user = await getCurrentUser();
  await db.certRecord.create({
    data: {
      staffId: d.staffId,
      certTypeId: d.certTypeId,
      certNumber: d.certNumber ?? "",
      issueDate: new Date(d.issueDate),
      expiryDate: new Date(d.expiryDate),
      notes: d.notes ?? "",
      documentId: d.documentId ? d.documentId : null,
      recordedBy: user?.name ?? user?.email ?? "Unknown",
    },
  });
  revalidateCerts(d.staffId);
  return { ok: true };
}

export async function deleteCertRecord(id: string) {
  await denyUnless("editContent");
  const c = await db.certRecord.delete({
    where: { id },
    select: { staffId: true },
  });
  revalidateCerts(c.staffId);
}
