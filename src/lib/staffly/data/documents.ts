import { db } from "@/lib/db";

export async function listDocumentsForStaff(staffId: string) {
  return db.staffDocument.findMany({
    where: { staffId },
    orderBy: { uploadedAt: "desc" },
  });
}

export type StaffDocumentRow = Awaited<
  ReturnType<typeof listDocumentsForStaff>
>[number];
