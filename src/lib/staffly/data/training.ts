import { db } from "@/lib/db";
import { centerScope } from "@/lib/center-context";

export async function listTrainingForStaff(staffId: string) {
  return db.trainingRecord.findMany({
    where: { staffId },
    orderBy: { completedDate: "desc" },
    include: { programme: { select: { id: true, name: true } } },
  });
}

export type TrainingRow = Awaited<
  ReturnType<typeof listTrainingForStaff>
>[number];

export async function listProgrammes() {
  return db.trainingProgramme.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    include: {
      requiredForRoles: { select: { id: true, name: true } },
      _count: { select: { trainingRecords: true, modules: true } },
    },
  });
}

export type ProgrammeWithDetail = Awaited<
  ReturnType<typeof listProgrammes>
>[number];

// Full programme + its ordered modules (with resources and completion counts),
// for the programme detail / module-builder page.
export async function getProgrammeDetail(id: string) {
  return db.trainingProgramme.findUnique({
    where: { id },
    include: {
      requiredForRoles: { select: { id: true, name: true } },
      _count: { select: { trainingRecords: true } },
      modules: {
        orderBy: { sortOrder: "asc" },
        include: {
          resources: { orderBy: { createdAt: "asc" } },
          _count: { select: { completions: true } },
        },
      },
    },
  });
}

export type ProgrammeDetail = NonNullable<
  Awaited<ReturnType<typeof getProgrammeDetail>>
>;
export type ModuleDetail = ProgrammeDetail["modules"][number];

// Per-staff module progress: programmes that are required for the staff
// member's role (or already started) and have modules, with this staff's
// completion state per module.
export async function getStaffProgrammeProgress(staffId: string) {
  const staff = await db.staffMember.findUnique({
    where: { id: staffId },
    select: { role: { select: { trainingProgrammes: { select: { id: true } } } } },
  });
  const requiredIds = staff?.role?.trainingProgrammes.map((p) => p.id) ?? [];

  const programmes = await db.trainingProgramme.findMany({
    where: {
      active: true,
      modules: { some: {} },
      OR: [
        { id: { in: requiredIds } },
        { modules: { some: { completions: { some: { staffId } } } } },
      ],
    },
    orderBy: { name: "asc" },
    include: {
      modules: {
        orderBy: { sortOrder: "asc" },
        include: {
          resources: { orderBy: { createdAt: "asc" } },
          completions: { where: { staffId }, take: 1 },
        },
      },
    },
  });

  return programmes.map((p) => {
    const modules = p.modules.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      estimatedMinutes: m.estimatedMinutes,
      hasAssessment: m.hasAssessment,
      passMark: m.passMark,
      resources: m.resources,
      completion: m.completions[0] ?? null,
    }));
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      required: requiredIds.includes(p.id),
      modules,
      total: modules.length,
      done: modules.filter((m) => m.completion).length,
    };
  });
}

export type StaffProgrammeProgress = Awaited<
  ReturnType<typeof getStaffProgrammeProgress>
>[number];
export type StaffModuleProgress = StaffProgrammeProgress["modules"][number];

export async function listActiveProgrammes() {
  return db.trainingProgramme.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      category: true,
      isOneTime: true,
      refreshIntervalMonths: true,
    },
  });
}

// Active programmes with their modules + this staff member's completion state,
// powering the "Log training → From library" module checklist.
export async function listActiveProgrammesForLogging(staffId: string) {
  const programmes = await db.trainingProgramme.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      category: true,
      isOneTime: true,
      refreshIntervalMonths: true,
      modules: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          title: true,
          hasAssessment: true,
          passMark: true,
          completions: { where: { staffId }, select: { id: true }, take: 1 },
        },
      },
    },
  });
  return programmes.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    isOneTime: p.isOneTime,
    refreshIntervalMonths: p.refreshIntervalMonths,
    modules: p.modules.map((m) => ({
      id: m.id,
      title: m.title,
      hasAssessment: m.hasAssessment,
      passMark: m.passMark,
      completed: m.completions.length > 0,
    })),
  }));
}

export type ProgrammeForLogging = Awaited<
  ReturnType<typeof listActiveProgrammesForLogging>
>[number];

// ── Training matrix ────────────────────────────────────────────────────────
// X-axis: required cert types + training programmes for the (optional) role.
// Y-axis: staff. Cells: latest record per (staff, item).

export interface MatrixColumn {
  kind: "cert" | "programme";
  id: string;
  name: string;
}

export interface MatrixCell {
  held: boolean;
  expiryDate: Date | null;
  reference: string | null; // cert number / record title
  recordId: string | null;
}

export interface MatrixRow {
  staffId: string;
  staffName: string;
  roleName: string | null;
  requiredCertIds: string[];
  requiredProgrammeIds: string[];
  cells: Record<string, MatrixCell>; // key = `${kind}:${id}`
}

export interface TrainingMatrix {
  columns: MatrixColumn[];
  rows: MatrixRow[];
}

export async function getTrainingMatrix(
  selectedId: string | null,
  roleId?: string | null,
): Promise<TrainingMatrix> {
  // Columns = the cert types + programmes that are required for at least one
  // role (or the filtered role). Keeps the grid focused on compliance items.
  const roleFilter = roleId ? { id: roleId } : {};
  const roles = await db.staffRole.findMany({
    where: { ...roleFilter },
    select: {
      requiredCertTypes: { select: { id: true, name: true } },
      trainingProgrammes: { select: { id: true, name: true } },
    },
  });

  const certMap = new Map<string, string>();
  const progMap = new Map<string, string>();
  for (const r of roles) {
    r.requiredCertTypes.forEach((c) => certMap.set(c.id, c.name));
    r.trainingProgrammes.forEach((p) => progMap.set(p.id, p.name));
  }

  const columns: MatrixColumn[] = [
    ...[...certMap].map(([id, name]) => ({ kind: "cert" as const, id, name })),
    ...[...progMap].map(([id, name]) => ({
      kind: "programme" as const,
      id,
      name,
    })),
  ];

  const staff = await db.staffMember.findMany({
    where: {
      ...centerScope(selectedId),
      status: { not: "INACTIVE" },
      ...(roleId ? { roleId } : {}),
    },
    orderBy: [{ lastName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: {
        select: {
          name: true,
          requiredCertTypes: { select: { id: true } },
          trainingProgrammes: { select: { id: true } },
        },
      },
      certifications: {
        select: { certTypeId: true, expiryDate: true, certNumber: true, id: true },
        orderBy: { expiryDate: "desc" },
      },
      trainingRecords: {
        where: { programmeId: { not: null } },
        select: {
          programmeId: true,
          expiryDate: true,
          title: true,
          id: true,
          outcome: true,
        },
        orderBy: { completedDate: "desc" },
      },
    },
  });

  const rows: MatrixRow[] = staff.map((s) => {
    const cells: Record<string, MatrixCell> = {};
    for (const col of columns) {
      if (col.kind === "cert") {
        const rec = s.certifications.find((c) => c.certTypeId === col.id);
        cells[`cert:${col.id}`] = rec
          ? {
              held: true,
              expiryDate: rec.expiryDate,
              reference: rec.certNumber || null,
              recordId: rec.id,
            }
          : { held: false, expiryDate: null, reference: null, recordId: null };
      } else {
        const rec = s.trainingRecords.find((t) => t.programmeId === col.id);
        cells[`programme:${col.id}`] = rec
          ? {
              held: rec.outcome === "PASS" || rec.outcome === "ATTENDED",
              expiryDate: rec.expiryDate,
              reference: rec.title,
              recordId: rec.id,
            }
          : { held: false, expiryDate: null, reference: null, recordId: null };
      }
    }
    return {
      staffId: s.id,
      staffName: `${s.firstName} ${s.lastName}`,
      roleName: s.role?.name ?? null,
      requiredCertIds: s.role?.requiredCertTypes.map((c) => c.id) ?? [],
      requiredProgrammeIds: s.role?.trainingProgrammes.map((p) => p.id) ?? [],
      cells,
    };
  });

  return { columns, rows };
}
