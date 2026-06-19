import { ShieldCheck } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { CertCard } from "@/components/staffly/certifications/CertCard";
import { AddCertButton } from "@/components/staffly/staff/TabAddButtons";
import { getCurrentUser, can } from "@/lib/auth";
import { listCertsForStaff } from "@/lib/staffly/data/certifications";
import { listActiveCertTypes } from "@/lib/staffly/data/cert-types";

export const metadata = { title: "Certifications" };

export default async function CertificationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [certs, certTypes, user] = await Promise.all([
    listCertsForStaff(id),
    listActiveCertTypes(),
    getCurrentUser(),
  ]);
  const canManage = can(user, "editContent");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-semibold text-ink">
            Certifications &amp; licences
          </h2>
          {certs.length > 0 && (
            <span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-xs font-semibold tnum text-muted-foreground">
              {certs.length}
            </span>
          )}
        </div>
        {canManage && <AddCertButton staffId={id} certTypes={certTypes} />}
      </div>

      {certs.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No certifications recorded"
          description="Add qualifications and licences — expiry dates feed the alerts and training matrix."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certs.map((c) => (
            <CertCard key={c.id} cert={c} canManage={canManage} />
          ))}
        </div>
      )}
    </div>
  );
}
