"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { denyUnless } from "@/lib/auth";
import { fieldErrorsFromZod, type FormState } from "@/lib/form";
import { staffRoleSchema } from "@/lib/staffly/validation";
import { logAudit } from "@/lib/staffly/audit";

function revalidateRoles() {
  revalidatePath("/settings");
  revalidatePath("/training-matrix");
  revalidatePath("/staff");
}

export async function createRole(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const denied = await denyUnless("admin");
  if (denied) return denied;

  const parsed = staffRoleSchema.safeParse({
    ...Object.fromEntries(formData),
    requiredCertTypeIds: formData.getAll("requiredCertTypeIds"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const d = parsed.data;
  const r = await db.staffRole.create({
    data: {
      name: d.name,
      centerId: d.centerId ? d.centerId : null,
      active: d.active,
      requiredCertTypes: {
        connect: d.requiredCertTypeIds.map((id) => ({ id })),
      },
    },
  });
  await logAudit({
    action: "role.created",
    entity: "StaffRole",
    entityId: r.id,
    summary: `Created role "${d.name}"`,
  });
  revalidateRoles();
  return { ok: true };
}

export async function updateRole(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const denied = await denyUnless("admin");
  if (denied) return denied;

  const parsed = staffRoleSchema.safeParse({
    ...Object.fromEntries(formData),
    requiredCertTypeIds: formData.getAll("requiredCertTypeIds"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const d = parsed.data;
  await db.staffRole.update({
    where: { id },
    data: {
      name: d.name,
      centerId: d.centerId ? d.centerId : null,
      active: d.active,
      requiredCertTypes: { set: d.requiredCertTypeIds.map((id) => ({ id })) },
    },
  });
  await logAudit({
    action: "role.updated",
    entity: "StaffRole",
    entityId: id,
    summary: `Updated role "${d.name}"`,
  });
  revalidateRoles();
  return { ok: true };
}

export async function setRoleActive(id: string, active: boolean) {
  await denyUnless("admin");
  const r = await db.staffRole.update({
    where: { id },
    data: { active },
    select: { name: true },
  });
  await logAudit({
    action: active ? "role.activated" : "role.deactivated",
    entity: "StaffRole",
    entityId: id,
    summary: `${active ? "Activated" : "Deactivated"} role "${r.name}"`,
  });
  revalidateRoles();
}
