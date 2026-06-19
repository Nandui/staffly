import { db } from "@/lib/db";

export interface AuditRow {
  id: string;
  actorName: string;
  action: string;
  entity: string;
  entityId: string | null;
  staffId: string | null;
  summary: string;
  detail: string | null;
  createdAt: Date;
}

// The audit trail is org-wide (it spans every entity), newest first.
export async function listAuditLog(limit = 300): Promise<AuditRow[]> {
  return db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: limit });
}

export async function recentActivity(limit = 8): Promise<AuditRow[]> {
  return db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: limit });
}

export async function auditForStaff(
  staffId: string,
  limit = 200,
): Promise<AuditRow[]> {
  return db.auditLog.findMany({
    where: { staffId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
