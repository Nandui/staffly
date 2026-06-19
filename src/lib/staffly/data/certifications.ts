import { db } from "@/lib/db";
import { centerScope } from "@/lib/center-context";

export interface CertAttachmentView {
  id: string;
  fileUrl: string;
  filename: string;
  fileType: string;
}

export interface CertRow {
  id: string;
  staffId: string;
  staffName: string;
  centerName: string;
  certTypeId: string;
  certType: string;
  issuingBody: string;
  certNumber: string;
  issueDate: Date;
  expiryDate: Date;
  notes: string;
  roleRequired: boolean;
  attachments: CertAttachmentView[];
}

function rowFrom(c: {
  id: string;
  staffId: string;
  certNumber: string;
  issueDate: Date;
  expiryDate: Date;
  notes: string;
  certType: { id: string; name: string; issuingBody: string };
  attachments: CertAttachmentView[];
  staff: {
    firstName: string;
    lastName: string;
    center: { name: string };
    role: { requiredCertTypes: { id: string }[] } | null;
  };
}): CertRow {
  return {
    id: c.id,
    staffId: c.staffId,
    staffName: `${c.staff.firstName} ${c.staff.lastName}`,
    centerName: c.staff.center.name,
    certTypeId: c.certType.id,
    certType: c.certType.name,
    issuingBody: c.certType.issuingBody,
    certNumber: c.certNumber,
    issueDate: c.issueDate,
    expiryDate: c.expiryDate,
    notes: c.notes,
    roleRequired:
      c.staff.role?.requiredCertTypes.some((r) => r.id === c.certType.id) ??
      false,
    attachments: c.attachments,
  };
}

const includeForRows = {
  certType: { select: { id: true, name: true, issuingBody: true } },
  attachments: {
    select: { id: true, fileUrl: true, filename: true, fileType: true },
    orderBy: { uploadedAt: "asc" },
  },
  staff: {
    select: {
      firstName: true,
      lastName: true,
      center: { select: { name: true } },
      role: { select: { requiredCertTypes: { select: { id: true } } } },
    },
  },
} as const;

export async function listCertsForStaff(staffId: string): Promise<CertRow[]> {
  const rows = await db.certRecord.findMany({
    where: { staffId },
    orderBy: { expiryDate: "asc" },
    include: includeForRows,
  });
  return rows.map(rowFrom);
}

export async function listAllCerts(
  selectedId: string | null,
): Promise<CertRow[]> {
  const rows = await db.certRecord.findMany({
    where: { staff: { ...centerScope(selectedId) } },
    orderBy: { expiryDate: "asc" },
    include: includeForRows,
  });
  return rows.map(rowFrom);
}
