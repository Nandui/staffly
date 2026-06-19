import { db } from "@/lib/db";

export async function listRoles() {
  return db.staffRole.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    include: {
      center: { select: { id: true, name: true } },
      requiredCertTypes: { select: { id: true, name: true } },
      trainingProgrammes: { select: { id: true, name: true } },
      _count: { select: { staff: true } },
    },
  });
}

export type RoleWithDetail = Awaited<ReturnType<typeof listRoles>>[number];

export async function listActiveRoles() {
  return db.staffRole.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      centerId: true,
      requiredCertTypes: { select: { id: true, name: true } },
    },
  });
}
