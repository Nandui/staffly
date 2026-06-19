import { ScrollText } from "lucide-react";
import { PageHeader } from "@/components/staffly/layout/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { AuditTable } from "@/components/staffly/audit/AuditTable";
import { requireUser } from "@/lib/auth";
import { listAuditLog } from "@/lib/staffly/data/audit";

export const metadata = { title: "Audit log" };

export default async function AuditPage() {
  await requireUser();
  const rows = await listAuditLog();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System"
        title="Audit log"
        description="An append-only trail of every change across Staffly — who did what, and when."
      />
      {rows.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No activity yet"
          description="Every create, edit and delete will be recorded here for full auditability."
        />
      ) : (
        <AuditTable rows={rows} />
      )}
    </div>
  );
}
