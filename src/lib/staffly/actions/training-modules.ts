"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { denyUnless, getCurrentUser } from "@/lib/auth";
import { fieldErrorsFromZod, type FormState } from "@/lib/form";
import {
  trainingModuleSchema,
  moduleResourceSchema,
  moduleCompletionSchema,
} from "@/lib/staffly/validation";
import { logAudit, staffDisplayName } from "@/lib/staffly/audit";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

function revalidateProgramme(programmeId: string) {
  revalidatePath(`/training-library/${programmeId}`);
  revalidatePath("/training-library");
}

function revalidateStaffTraining(staffId: string) {
  revalidatePath(`/staff/${staffId}/training`);
  revalidatePath(`/staff/${staffId}/overview`);
  revalidatePath(`/staff/${staffId}/timeline`);
  revalidatePath("/training-matrix");
}

async function actorName() {
  const user = await getCurrentUser();
  return user?.name ?? user?.email ?? "Unknown";
}

// ── Modules ──────────────────────────────────────────────────────────────────

export async function createModule(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const denied = await denyUnless("editContent");
  if (denied) return denied;

  const parsed = trainingModuleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const d = parsed.data;
  const agg = await db.trainingModule.aggregate({
    where: { programmeId: d.programmeId },
    _max: { sortOrder: true },
  });
  const mod = await db.trainingModule.create({
    data: {
      programmeId: d.programmeId,
      title: d.title,
      description: d.description ?? "",
      sortOrder: (agg._max.sortOrder ?? 0) + 1,
      estimatedMinutes: d.estimatedMinutes,
      hasAssessment: d.hasAssessment,
      passMark: d.hasAssessment ? d.passMark : null,
    },
  });
  await logAudit({
    action: "module.created",
    entity: "TrainingModule",
    entityId: mod.id,
    summary: `Added module "${d.title}"`,
  });
  revalidateProgramme(d.programmeId);
  return { ok: true };
}

export async function updateModule(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const denied = await denyUnless("editContent");
  if (denied) return denied;

  const parsed = trainingModuleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const d = parsed.data;
  await db.trainingModule.update({
    where: { id },
    data: {
      title: d.title,
      description: d.description ?? "",
      estimatedMinutes: d.estimatedMinutes,
      hasAssessment: d.hasAssessment,
      passMark: d.hasAssessment ? d.passMark : null,
    },
  });
  await logAudit({
    action: "module.updated",
    entity: "TrainingModule",
    entityId: id,
    summary: `Updated module "${d.title}"`,
  });
  revalidateProgramme(d.programmeId);
  return { ok: true };
}

export async function deleteModule(id: string) {
  await denyUnless("editContent");
  const mod = await db.trainingModule.findUnique({
    where: { id },
    select: { title: true, programmeId: true },
  });
  if (!mod) return;
  await db.trainingModule.delete({ where: { id } });
  await logAudit({
    action: "module.deleted",
    entity: "TrainingModule",
    entityId: id,
    summary: `Deleted module "${mod.title}"`,
  });
  revalidateProgramme(mod.programmeId);
}

export async function moveModule(id: string, dir: "up" | "down") {
  await denyUnless("editContent");
  const m = await db.trainingModule.findUnique({
    where: { id },
    select: { id: true, sortOrder: true, programmeId: true },
  });
  if (!m) return;
  const neighbor = await db.trainingModule.findFirst({
    where: {
      programmeId: m.programmeId,
      sortOrder: dir === "up" ? { lt: m.sortOrder } : { gt: m.sortOrder },
    },
    orderBy: { sortOrder: dir === "up" ? "desc" : "asc" },
    select: { id: true, sortOrder: true },
  });
  if (!neighbor) return;
  await db.$transaction([
    db.trainingModule.update({
      where: { id: m.id },
      data: { sortOrder: neighbor.sortOrder },
    }),
    db.trainingModule.update({
      where: { id: neighbor.id },
      data: { sortOrder: m.sortOrder },
    }),
  ]);
  revalidateProgramme(m.programmeId);
}

// ── Resources (links + uploaded files) ───────────────────────────────────────

export async function addModuleResource(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const denied = await denyUnless("editContent");
  if (denied) return denied;

  const parsed = moduleResourceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const d = parsed.data;
  const mod = await db.trainingModule.findUnique({
    where: { id: d.moduleId },
    select: { programmeId: true },
  });
  if (!mod) return { ok: false, error: "Module not found." };
  const actor = await actorName();

  const file = formData.get("file");
  const hasFile = file instanceof File && file.size > 0;

  let data:
    | {
        kind: "FILE";
        url: string;
        filename: string;
        fileType: string;
        fileSizeKb: number;
      }
    | { kind: "LINK"; url: string };

  if (hasFile) {
    if (file.size > MAX_FILE_BYTES) {
      return { ok: false, error: "File must be 10MB or smaller." };
    }
    try {
      const { put } = await import("@vercel/blob");
      const blob = await put(
        `staffly/modules/${d.moduleId}/${file.name}`,
        file,
        { access: "public", addRandomSuffix: true },
      );
      data = {
        kind: "FILE",
        url: blob.url,
        filename: file.name,
        fileType: file.type || "application/octet-stream",
        fileSizeKb: Math.max(1, Math.round(file.size / 1024)),
      };
    } catch {
      return {
        ok: false,
        error:
          "Upload failed. Vercel Blob isn't configured — set BLOB_READ_WRITE_TOKEN.",
      };
    }
  } else if (d.url) {
    data = { kind: "LINK", url: d.url };
  } else {
    return { ok: false, error: "Add a link URL or choose a file." };
  }

  const resource = await db.trainingModuleResource.create({
    data: { moduleId: d.moduleId, label: d.label, uploadedBy: actor, ...data },
  });
  await logAudit({
    action: "module.resource_added",
    entity: "TrainingModuleResource",
    entityId: resource.id,
    summary: `Added ${data.kind === "FILE" ? "file" : "link"} "${d.label}" to a module`,
  });
  revalidateProgramme(mod.programmeId);
  return { ok: true };
}

export async function deleteModuleResource(id: string) {
  await denyUnless("editContent");
  const resource = await db.trainingModuleResource.findUnique({
    where: { id },
    select: { label: true, module: { select: { programmeId: true } } },
  });
  if (!resource) return;
  await db.trainingModuleResource.delete({ where: { id } });
  await logAudit({
    action: "module.resource_deleted",
    entity: "TrainingModuleResource",
    entityId: id,
    summary: `Removed resource "${resource.label}" from a module`,
  });
  revalidateProgramme(resource.module.programmeId);
}

// ── Per-staff completion ─────────────────────────────────────────────────────

export async function markModuleComplete(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const denied = await denyUnless("editContent");
  if (denied) return denied;

  const parsed = moduleCompletionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const d = parsed.data;
  const mod = await db.trainingModule.findUnique({
    where: { id: d.moduleId },
    select: { title: true, programmeId: true },
  });
  if (!mod) return { ok: false, error: "Module not found." };
  const actor = await actorName();

  await db.trainingModuleCompletion.upsert({
    where: { moduleId_staffId: { moduleId: d.moduleId, staffId: d.staffId } },
    create: {
      moduleId: d.moduleId,
      staffId: d.staffId,
      completedDate: new Date(d.completedDate),
      score: d.score,
      passed: d.passed,
      notes: d.notes ?? "",
      recordedBy: actor,
    },
    update: {
      completedDate: new Date(d.completedDate),
      score: d.score,
      passed: d.passed,
      notes: d.notes ?? "",
    },
  });
  await logAudit({
    action: "module.completed",
    entity: "TrainingModuleCompletion",
    staffId: d.staffId,
    summary: `Recorded module "${mod.title}" for ${await staffDisplayName(d.staffId)}`,
  });
  revalidateStaffTraining(d.staffId);
  revalidateProgramme(mod.programmeId);
  return { ok: true };
}

export async function clearModuleComplete(moduleId: string, staffId: string) {
  await denyUnless("editContent");
  const mod = await db.trainingModule.findUnique({
    where: { id: moduleId },
    select: { title: true, programmeId: true },
  });
  await db.trainingModuleCompletion.deleteMany({ where: { moduleId, staffId } });
  await logAudit({
    action: "module.cleared",
    entity: "TrainingModuleCompletion",
    staffId,
    summary: `Cleared module "${mod?.title ?? ""}" for ${await staffDisplayName(staffId)}`,
  });
  revalidateStaffTraining(staffId);
  if (mod) revalidateProgramme(mod.programmeId);
}
