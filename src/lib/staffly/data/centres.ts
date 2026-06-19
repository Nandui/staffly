import { db } from "@/lib/db";

export async function listCentresWithCounts() {
  return db.center.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    include: { _count: { select: { staff: true } } },
  });
}

export type CentreWithCounts = Awaited<
  ReturnType<typeof listCentresWithCounts>
>[number];
