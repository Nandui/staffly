"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { denyUnless } from "@/lib/auth";
import { fieldErrorsFromZod, emptyToNull, type FormState } from "@/lib/form";
import { slugify } from "@/lib/utils";
import { centreSchema } from "@/lib/staffly/validation";

async function uniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let i = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await db.center.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    });
    if (!existing) return slug;
    slug = `${base}-${i++}`;
  }
}

// The active-centre list is cached (center-context, tag "centers") and powers
// the sidebar switcher + staff form, so refresh it after any change.
function revalidateCentres() {
  revalidateTag("centers", { expire: 0 });
  revalidatePath("/settings");
  revalidatePath("/", "layout");
}

export async function createCentre(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const denied = await denyUnless("admin");
  if (denied) return denied;

  const parsed = centreSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const d = parsed.data;
  await db.center.create({
    data: {
      name: d.name,
      slug: await uniqueSlug(d.name),
      address: emptyToNull(d.address),
      contactName: emptyToNull(d.contactName),
      contactEmail: emptyToNull(d.contactEmail),
      phone: emptyToNull(d.phone),
      notes: emptyToNull(d.notes),
      isActive: d.active,
    },
  });
  revalidateCentres();
  return { ok: true };
}

export async function updateCentre(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const denied = await denyUnless("admin");
  if (denied) return denied;

  const parsed = centreSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const d = parsed.data;
  await db.center.update({
    where: { id },
    data: {
      name: d.name,
      slug: await uniqueSlug(d.name, id),
      address: emptyToNull(d.address),
      contactName: emptyToNull(d.contactName),
      contactEmail: emptyToNull(d.contactEmail),
      phone: emptyToNull(d.phone),
      notes: emptyToNull(d.notes),
      isActive: d.active,
    },
  });
  revalidateCentres();
  return { ok: true };
}

export async function setCentreActive(id: string, isActive: boolean) {
  await denyUnless("admin");
  await db.center.update({ where: { id }, data: { isActive } });
  revalidateCentres();
}
