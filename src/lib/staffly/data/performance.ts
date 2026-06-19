import { db } from "@/lib/db";

export async function listPerformanceNotes(staffId: string) {
  return db.performanceNote.findMany({
    where: { staffId },
    orderBy: { noteDate: "desc" },
  });
}

export type PerformanceNoteRow = Awaited<
  ReturnType<typeof listPerformanceNotes>
>[number];
