"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { denyUnless, getCurrentUser } from "@/lib/auth";
import { fieldErrorsFromZod, type FormState } from "@/lib/form";
import { performanceNoteSchema } from "@/lib/staffly/validation";

function revalidatePerf(staffId: string) {
  revalidatePath(`/staffly/staff/${staffId}/performance`);
  revalidatePath(`/staffly/staff/${staffId}/overview`);
  revalidatePath(`/staffly/staff/${staffId}/timeline`);
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
  await db.performanceNote.create({
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
  revalidatePerf(d.staffId);
  return { ok: true };
}

export async function deletePerformanceNote(id: string) {
  await denyUnless("editContent");
  const n = await db.performanceNote.delete({
    where: { id },
    select: { staffId: true },
  });
  revalidatePerf(n.staffId);
}
