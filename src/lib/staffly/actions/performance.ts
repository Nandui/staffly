"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { denyUnless, getCurrentUser } from "@/lib/auth";
import { fieldErrorsFromZod, type FormState } from "@/lib/form";
import { performanceNoteSchema } from "@/lib/staffly/validation";
import { logAudit, staffDisplayName } from "@/lib/staffly/audit";

function revalidatePerf(staffId: string) {
  revalidatePath(`/staff/${staffId}/performance`);
  revalidatePath(`/staff/${staffId}/overview`);
  revalidatePath(`/staff/${staffId}/timeline`);
}

export async function addPerformanceNote(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const denied = await denyUnless("editContent");
  if (denied) return denied;

  const parsed = performanceNoteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const d = parsed.data;
  const user = await getCurrentUser();
  const note = await db.performanceNote.create({
    data: {
      staffId: d.staffId,
      category: d.category,
      title: d.title,
      body: d.body,
      visibility: d.visibility,
      noteDate: new Date(d.noteDate),
      createdBy: user?.name ?? user?.email ?? "Unknown",
    },
  });
  await logAudit({
    action: "performance.added",
    entity: "PerformanceNote",
    entityId: note.id,
    staffId: d.staffId,
    summary: `Added ${d.category.toLowerCase()} note "${d.title}" for ${await staffDisplayName(d.staffId)}`,
  });
  revalidatePerf(d.staffId);
  return { ok: true };
}

export async function deletePerformanceNote(id: string) {
  await denyUnless("editContent");
  const n = await db.performanceNote.delete({
    where: { id },
    select: { staffId: true },
  });
  await logAudit({
    action: "performance.deleted",
    entity: "PerformanceNote",
    entityId: id,
    staffId: n.staffId,
    summary: `Deleted a performance note for ${await staffDisplayName(n.staffId)}`,
  });
  revalidatePerf(n.staffId);
}
