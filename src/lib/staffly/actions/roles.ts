"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { denyUnless } from "@/lib/auth";
import { fieldErrorsFromZod, type FormState } from "@/lib/form";
import { staffRoleSchema } from "@/lib/staffly/validation";

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
  await db.staffRole.create({
    data: {
      name: d.name,
      centerId: d.centerId ? d.centerId : null,
      active: d.active,
      requiredCertTypes: {
        connect: d.requiredCertTypeIds.map((id) => ({ id })),
      },
    },
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
  revalidateRoles();
  return { ok: true };
}

export async function setRoleActive(id: string, active: boolean) {
  await denyUnless("admin");
  await db.staffRole.update({ where: { id }, data: { active } });
  revalidateRoles();
}
