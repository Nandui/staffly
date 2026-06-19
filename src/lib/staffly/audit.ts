import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export interface AuditInput {
  action: string; // e.g. "staff.created", "cert.deleted"
  entity: string; // "StaffMember" | "AbsenceRecord" | …
  entityId?: string | null;
  staffId?: string | null;
  centerId?: string | null;
  summary: string;
  detail?: string | null;
}

// Append an entry to the audit trail. Best-effort: a logging failure must never
// break the underlying mutation, so errors are swallowed (and logged).
export async function logAudit(input: AuditInput): Promise<void> {
  try {
    const user = await getCurrentUser();
    await db.auditLog.create({
      data: {
        actorId: user?.id ?? null,
        actorName: user?.name ?? user?.email ?? "System",
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        staffId: input.staffId ?? null,
        centerId: input.centerId ?? null,
        summary: input.summary,
        detail: input.detail ?? null,
      },
    });
  } catch (err) {
    console.error("[audit] failed to record", input.action, err);
  }
}

// Convenience: a staff member's display name for audit summaries.
export async function staffDisplayName(staffId: string): Promise<string> {
  const s = await db.staffMember.findUnique({
    where: { id: staffId },
    select: { firstName: true, lastName: true },
  });
  return s ? `${s.firstName} ${s.lastName}` : "a staff member";
}
