"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { denyUnless } from "@/lib/auth";
import { fieldErrorsFromZod, type FormState } from "@/lib/form";
import { certTypeSchema } from "@/lib/staffly/validation";

function revalidateCertTypes() {
  revalidatePath("/staffly/settings");
  revalidatePath("/staffly/certifications");
}

export async function createCertType(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const denied = await denyUnless("admin");
  if (denied) return denied;

  const parsed = certTypeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const d = parsed.data;
  await db.certType.create({
    data: {
      name: d.name,
      issuingBody: d.issuingBody,
      validityMonths: d.validityMonths,
      description: d.description ?? "",
      isBuiltIn: false,
    },
  });
  revalidateCertTypes();
  return { ok: true };
}

export async function updateCertType(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const denied = await denyUnless("admin");
  if (denied) return denied;

  // Built-in cert types are deactivatable but not editable (spec §23).
  const existing = await db.certType.findUnique({
    where: { id },
    select: { isBuiltIn: true },
  });
  if (existing?.isBuiltIn) {
    return { ok: false, error: "Built-in cert types can't be edited." };
  }

  const parsed = certTypeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const d = parsed.data;
  await db.certType.update({
    where: { id },
    data: {
      name: d.name,
      issuingBody: d.issuingBody,
      validityMonths: d.validityMonths,
      description: d.description ?? "",
    },
  });
  revalidateCertTypes();
  return { ok: true };
}

export async function setCertTypeActive(id: string, active: boolean) {
  await denyUnless("admin");
  await db.certType.update({ where: { id }, data: { active } });
  revalidateCertTypes();
}
