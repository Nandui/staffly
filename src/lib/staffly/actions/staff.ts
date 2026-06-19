"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { denyUnless, assertCan } from "@/lib/auth";
import { fieldErrorsFromZod, type FormState } from "@/lib/form";
import { staffSchema } from "@/lib/staffly/validation";
import { logAudit } from "@/lib/staffly/audit";

function toData(d: ReturnType<typeof staffSchema.parse>) {
  return {
    firstName: d.firstName,
    lastName: d.lastName,
    email: d.email,
    phone: d.phone ?? "",
    centerId: d.centerId,
    roleId: d.roleId ? d.roleId : null,
    status: d.status,
    startDate: new Date(d.startDate),
    endDate: d.endDate ? new Date(d.endDate) : null,
    notes: d.notes ?? "",
  };
}

export async function createStaff(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const denied = await denyUnless("editContent");
  if (denied) return denied;

  const parsed = staffSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const created = await db.staffMember.create({ data: toData(parsed.data) });
  await logAudit({
    action: "staff.created",
    entity: "StaffMember",
    entityId: created.id,
    staffId: created.id,
    centerId: created.centerId,
    summary: `Added staff member ${created.firstName} ${created.lastName}`,
  });
  revalidatePath("/staff");
  revalidatePath("/");
  redirect(`/staff/${created.id}/overview`);
}

export async function updateStaff(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const denied = await denyUnless("editContent");
  if (denied) return denied;

  const parsed = staffSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const updated = await db.staffMember.update({
    where: { id },
    data: toData(parsed.data),
  });
  await logAudit({
    action: "staff.updated",
    entity: "StaffMember",
    entityId: id,
    staffId: id,
    centerId: updated.centerId,
    summary: `Updated ${updated.firstName} ${updated.lastName}'s profile`,
  });
  revalidatePath("/staff");
  revalidatePath(`/staff/${id}`, "layout");
  redirect(`/staff/${id}/overview`);
}

export async function deleteStaff(id: string): Promise<FormState> {
  const denied = await denyUnless("admin");
  if (denied) return denied;
  const deleted = await db.staffMember.delete({ where: { id } });
  await logAudit({
    action: "staff.deleted",
    entity: "StaffMember",
    entityId: id,
    summary: `Deleted staff member ${deleted.firstName} ${deleted.lastName}`,
  });
  revalidatePath("/staff");
  revalidatePath("/");
  redirect("/staff");
}

export async function setStaffStatus(id: string, status: string) {
  await assertCan("editContent");
  const s = await db.staffMember.update({
    where: { id },
    data: {
      status: status as "ACTIVE" | "INACTIVE" | "ON_LEAVE" | "PROBATION",
    },
  });
  await logAudit({
    action: "staff.status_changed",
    entity: "StaffMember",
    entityId: id,
    staffId: id,
    summary: `Set ${s.firstName} ${s.lastName}'s status to ${status}`,
  });
  revalidatePath("/staff");
  revalidatePath(`/staff/${id}`, "layout");
}
