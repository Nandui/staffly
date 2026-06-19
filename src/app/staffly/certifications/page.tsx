import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/staffly/layout/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { CertOverviewTable } from "@/components/staffly/certifications/CertOverviewTable";
import {
  ExcelExportButton,
  PdfExportButton,
} from "@/components/staffly/shared/ExportButtons";
import { getCenterContext } from "@/lib/center-context";
import { listAllCerts } from "@/lib/staffly/data/certifications";
import { certStatusFromExpiry, daysUntil } from "@/lib/staffly/utils";
import { CERT_STATUS_META } from "@/lib/staffly/constants";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Certifications" };

export default async function CertificationsOverviewPage() {
  const { selected, selectedId } = await getCenterContext();
  const certs = await listAllCerts(selectedId);

  const excelRows = certs.map((c) => ({
    Staff: c.staffName,
    Centre: c.centerName,
    "Cert type": c.certType,
    "Issuing body": c.issuingBody,
    "Cert no": c.certNumber,
    Issued: formatDate(c.issueDate),
    Expiry: formatDate(c.expiryDate),
    "Days left": daysUntil(c.expiryDate),
    Status: CERT_STATUS_META[certStatusFromExpiry(c.expiryDate)].label,
    "Role required": c.roleRequired ? "Yes" : "No",
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={selected ? selected.name : "All centres"}
        title="Certifications"
        description="Every qualification and licence, with days-to-expiry and role requirements."
        actions={
          certs.length > 0 ? (
            <div className="flex gap-2">
              <ExcelExportButton
                filename="staffly-certifications.xlsx"
                sheetName="Certifications"
                rows={excelRows}
              />
              <PdfExportButton
                targetId="cert-overview"
                filename="staffly-certifications.pdf"
                title="Certifications"
                subtitle={selected ? selected.name : "All centres"}
              />
            </div>
          ) : undefined
        }
      />

      {certs.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No certifications yet"
          description="Add certifications on a staff member's profile to track expiry across your centres."
        />
      ) : (
        <div id="cert-overview">
          <CertOverviewTable rows={certs} />
        </div>
      )}
    </div>
  );
}
