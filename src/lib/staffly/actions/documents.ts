"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { denyUnless, getCurrentUser } from "@/lib/auth";
import { fieldErrorsFromZod, type FormState } from "@/lib/form";
import { documentSchema } from "@/lib/staffly/validation";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

function revalidateDocs(staffId: string) {
  revalidatePath(`/staff/${staffId}/documents`);
  revalidatePath(`/staff/${staffId}/timeline`);
}

export async function uploadDocument(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const denied = await denyUnless("editContent");
  if (denied) return denied;

  const staffId = String(formData.get("staffId") ?? "");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a file to upload." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "File must be 5MB or smaller." };
  }

  // Store the file in Vercel Blob and keep only the URL (no base64 in the DB).
  let fileUrl: string;
  try {
    const { put } = await import("@vercel/blob");
    const blob = await put(
      `staffly/${staffId}/${Date.now()}-${file.name}`,
      file,
      { access: "public", addRandomSuffix: true },
    );
    fileUrl = blob.url;
  } catch {
    return {
      ok: false,
      error:
        "Upload failed. Vercel Blob isn't configured — set BLOB_READ_WRITE_TOKEN.",
    };
  }

  const parsed = documentSchema.safeParse({
    staffId,
    name: formData.get("name"),
    category: formData.get("category"),
    fileUrl,
    filename: file.name,
    fileSizeKb: Math.max(1, Math.round(file.size / 1024)),
    fileType: file.type || "application/octet-stream",
    expiryDate: formData.get("expiryDate") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const d = parsed.data;
  const user = await getCurrentUser();
  await db.staffDocument.create({
    data: {
      staffId: d.staffId,
      category: d.category,
      name: d.name,
      filename: d.filename,
      fileUrl: d.fileUrl,
      fileSizeKb: d.fileSizeKb,
      fileType: d.fileType,
      expiryDate: d.expiryDate ? new Date(d.expiryDate) : null,
      notes: d.notes ?? "",
      uploadedBy: user?.name ?? user?.email ?? "Unknown",
    },
  });
  revalidateDocs(d.staffId);
  return { ok: true };
}

export async function deleteDocument(id: string) {
  await denyUnless("editContent");
  const doc = await db.staffDocument.delete({
    where: { id },
    select: { staffId: true },
  });
  revalidateDocs(doc.staffId);
}
