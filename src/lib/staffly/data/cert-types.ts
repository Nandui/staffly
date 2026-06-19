import { db } from "@/lib/db";

export async function listCertTypes() {
  return db.certType.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    include: {
      _count: { select: { certRecords: true, requiredByRoles: true } },
    },
  });
}

export type CertTypeWithCounts = Awaited<
  ReturnType<typeof listCertTypes>
>[number];

export async function listActiveCertTypes() {
  return db.certType.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, issuingBody: true, validityMonths: true },
  });
}
