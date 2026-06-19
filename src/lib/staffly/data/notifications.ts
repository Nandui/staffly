import { db } from "@/lib/db";
import { centerScope } from "@/lib/center-context";
import {
  buildNotifications,
  isUnacknowledgedMediumPlus,
  type CertRecordForNotify,
  type StafflyNotification,
} from "@/lib/staffly/notifications";

async function loadCertRecords(
  selectedId: string | null,
): Promise<CertRecordForNotify[]> {
  const rows = await db.certRecord.findMany({
    where: { staff: { ...centerScope(selectedId) } },
    include: {
      certType: { select: { name: true } },
      staff: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          center: { select: { name: true } },
          role: {
            select: {
              name: true,
              requiredCertTypes: { select: { id: true } },
            },
          },
        },
      },
    },
  });

  return rows.map((c) => ({
    id: c.id,
    staffId: c.staffId,
    staffName: `${c.staff.firstName} ${c.staff.lastName}`,
    certType: c.certType.name,
    centerName: c.staff.center.name,
    expiryDate: c.expiryDate,
    roleRequired:
      c.staff.role?.requiredCertTypes.some((r) => r.id === c.certTypeId) ??
      false,
    roleName: c.staff.role?.name ?? null,
  }));
}

async function ackMap(): Promise<Map<string, Date>> {
  const acks = await db.certNotificationAck.findMany();
  const map = new Map<string, Date>();
  for (const a of acks) {
    map.set(`${a.certRecordId}:${a.priority}`, a.acknowledgedAt);
  }
  return map;
}

export async function getNotifications(
  selectedId: string | null,
): Promise<StafflyNotification[]> {
  const [records, acks] = await Promise.all([
    loadCertRecords(selectedId),
    ackMap(),
  ]);
  return buildNotifications(records, acks);
}

export async function getUnacknowledgedCount(
  selectedId: string | null,
): Promise<number> {
  const notifications = await getNotifications(selectedId);
  return notifications.filter(isUnacknowledgedMediumPlus).length;
}
