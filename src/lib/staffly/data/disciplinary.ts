import { db } from "@/lib/db";

export async function listDisciplinary(staffId: string) {
  return db.disciplinaryRecord.findMany({
    where: { staffId },
    orderBy: { meetingDate: "desc" },
  });
}

export type DisciplinaryRow = Awaited<
  ReturnType<typeof listDisciplinary>
>[number];

export async function getDisciplinary(id: string) {
  return db.disciplinaryRecord.findUnique({ where: { id } });
}
