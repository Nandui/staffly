"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { denyUnless, getCurrentUser } from "@/lib/auth";
import { getNotifications } from "@/lib/staffly/data/notifications";
import { isUnacknowledgedMediumPlus } from "@/lib/staffly/notifications";
import { logAudit } from "@/lib/staffly/audit";

function revalidateNotifications() {
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}

export async function acknowledgeNotification(
  certRecordId: string,
  priority: string,
) {
  await denyUnless("editContent");
  const user = await getCurrentUser();
  await db.certNotificationAck.upsert({
    where: { certRecordId_priority: { certRecordId, priority } },
    create: {
      certRecordId,
      priority,
      acknowledgedBy: user?.name ?? user?.email ?? "Unknown",
    },
    update: {},
  });
  const cert = await db.certRecord.findUnique({
    where: { id: certRecordId },
    select: {
      staffId: true,
      staff: { select: { firstName: true, lastName: true } },
      certType: { select: { name: true } },
    },
  });
  await logAudit({
    action: "notification.acknowledged",
    entity: "CertRecord",
    entityId: certRecordId,
    staffId: cert?.staffId ?? null,
    summary: cert
      ? `Acknowledged ${priority} alert — ${cert.staff.firstName} ${cert.staff.lastName}'s ${cert.certType.name}`
      : `Acknowledged a ${priority} certification alert`,
  });
  revalidateNotifications();
}

export async function acknowledgeAll(selectedId: string | null) {
  await denyUnless("editContent");
  const user = await getCurrentUser();
  const actor = user?.name ?? user?.email ?? "Unknown";

  const pending = (await getNotifications(selectedId)).filter(
    isUnacknowledgedMediumPlus,
  );
  await Promise.all(
    pending.map((n) =>
      db.certNotificationAck.upsert({
        where: {
          certRecordId_priority: {
            certRecordId: n.certRecordId,
            priority: n.priority,
          },
        },
        create: {
          certRecordId: n.certRecordId,
          priority: n.priority,
          acknowledgedBy: actor,
        },
        update: {},
      }),
    ),
  );
  await logAudit({
    action: "notification.acknowledged_all",
    entity: "CertNotificationAck",
    summary: `Acknowledged ${pending.length} certification alert${pending.length === 1 ? "" : "s"}`,
  });
  revalidateNotifications();
}
