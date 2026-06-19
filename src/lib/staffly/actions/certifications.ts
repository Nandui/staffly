"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { denyUnless, getCurrentUser } from "@/lib/auth";
import { fieldErrorsFromZod, type FormState } from "@/lib/form";
import { addCertRecordSchema } from "@/lib/staffly/validation";
import { logAudit, staffDisplayName } from "@/lib/staffly/audit";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB each
const MAX_PHOTOS = 8;

function revalidateCerts(staffId: string) {
  revalidatePath(`/staff/${staffId}/certifications`);
  revalidatePath(`/staff/${staffId}/overview`);
  revalidatePath(`/staff/${staffId}/timeline`);
  revalidatePath("/certifications");
  revalidatePath("/training-matrix");
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
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
  const actor = user?.name ?? user?.email ?? "Unknown";

  // Optional photos (one or more): validate, then upload to Vercel Blob.
  const photos = formData
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (photos.length > MAX_PHOTOS) {
    return { ok: false, error: `Attach at most ${MAX_PHOTOS} photos.` };
  }
  if (photos.some((p) => p.size > MAX_PHOTO_BYTES)) {
    return { ok: false, error: "Each photo must be 5MB or smaller." };
  }

  const attachments: {
    fileUrl: string;
    filename: string;
    fileType: string;
    fileSizeKb: number;
    uploadedBy: string;
  }[] = [];
  if (photos.length) {
    try {
      const { put } = await import("@vercel/blob");
      for (const p of photos) {
        const blob = await put(`staffly/certs/${d.staffId}/${p.name}`, p, {
          access: "public",
          addRandomSuffix: true,
        });
        attachments.push({
          fileUrl: blob.url,
          filename: p.name,
          fileType: p.type || "image/jpeg",
          fileSizeKb: Math.max(1, Math.round(p.size / 1024)),
          uploadedBy: actor,
        });
      }
    } catch {
      return {
        ok: false,
        error:
          "Photo upload failed. Vercel Blob isn't configured — set BLOB_READ_WRITE_TOKEN.",
      };
    }
  }

  const cert = await db.certRecord.create({
    data: {
      staffId: d.staffId,
      certTypeId: d.certTypeId,
      certNumber: d.certNumber ?? "",
      issueDate: new Date(d.issueDate),
      expiryDate: new Date(d.expiryDate),
      notes: d.notes ?? "",
      documentId: d.documentId ? d.documentId : null,
      recordedBy: actor,
      attachments: attachments.length ? { create: attachments } : undefined,
    },
    include: { certType: { select: { name: true } } },
  });

  await logAudit({
    action: "cert.added",
    entity: "CertRecord",
    entityId: cert.id,
    staffId: d.staffId,
    summary:
      `Added ${cert.certType.name} for ${await staffDisplayName(d.staffId)}` +
      (attachments.length
        ? ` (${attachments.length} photo${attachments.length === 1 ? "" : "s"})`
        : ""),
  });
  revalidateCerts(d.staffId);
  return { ok: true };
}

export async function deleteCertRecord(id: string) {
  await denyUnless("editContent");
  const existing = await db.certRecord.findUnique({
    where: { id },
    select: { staffId: true, certType: { select: { name: true } } },
  });
  await db.certRecord.delete({ where: { id } });
  if (existing) {
    await logAudit({
      action: "cert.deleted",
      entity: "CertRecord",
      entityId: id,
      staffId: existing.staffId,
      summary: `Removed ${existing.certType.name} for ${await staffDisplayName(
        existing.staffId,
      )}`,
    });
    revalidateCerts(existing.staffId);
  }
}
