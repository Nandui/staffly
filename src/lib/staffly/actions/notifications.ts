"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { denyUnless, getCurrentUser } from "@/lib/auth";
import { getNotifications } from "@/lib/staffly/data/notifications";
import { isUnacknowledgedMediumPlus } from "@/lib/staffly/notifications";

function revalidateNotifications() {
  revalidatePath("/staffly/notifications");
  revalidatePath("/staffly", "layout");
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
  revalidateNotifications();
}
