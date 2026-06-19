import { PrismaClient } from "@prisma/client";
import { addDays, addMonths, subDays, subMonths } from "date-fns";

const db = new PrismaClient();
const now = new Date();

// Pre-loaded certification types (all built-in: deactivatable, not deletable).
const CERT_TYPES = [
  { name: "NPLQ — National Pool Lifeguard Qualification", issuingBody: "RLSS", validityMonths: 24 },
  { name: "First Aid / AED", issuingBody: "Various", validityMonths: 24 },
  { name: "Pool Plant Operations", issuingBody: "ISRM", validityMonths: 36 },
  { name: "Fire Safety Awareness", issuingBody: "Internal / External", validityMonths: 12 },
  { name: "Manual Handling", issuingBody: "HSA / External", validityMonths: 36 },
  { name: "Child Safeguarding", issuingBody: "Tusla / External", validityMonths: 24 },
  { name: "Garda Vetting", issuingBody: "An Garda Síochána", validityMonths: 60 },
  { name: "Swim Teacher Qualification", issuingBody: "Swim Ireland / STA", validityMonths: 36 },
  { name: "Food Safety / HACCP", issuingBody: "QQI / External", validityMonths: 12 },
  { name: "GDPR Awareness", issuingBody: "Internal / External", validityMonths: 12 },
];

async function main() {
  // ---- Clear Staffly data (FK-safe order; users are left intact) ----
  await db.certNotificationAck.deleteMany();
  await db.staffMember.deleteMany(); // cascades absence/perf/disciplinary/docs/certs/training
  await db.trainingProgramme.deleteMany();
  await db.certType.deleteMany();
  await db.staffRole.deleteMany();
  await db.center.deleteMany();

  // ---- Centres (LeisureWorld) ----
  const cork = await db.center.create({
    data: { name: "LeisureWorld Cork", slug: "leisureworld-cork", address: "Bishopstown, Cork", isActive: true },
  });
  const mahon = await db.center.create({
    data: { name: "LeisureWorld Mahon", slug: "leisureworld-mahon", address: "Mahon Point, Cork", isActive: true },
  });
  const ballincollig = await db.center.create({
    data: { name: "LeisureWorld Ballincollig", slug: "leisureworld-ballincollig", address: "Ballincollig, Cork", isActive: true },
  });

  // ---- Cert types (built-in) ----
  const certByName: Record<string, { id: string; validityMonths: number }> = {};
  for (const c of CERT_TYPES) {
    const created = await db.certType.create({ data: { ...c, isBuiltIn: true } });
    certByName[c.name] = { id: created.id, validityMonths: c.validityMonths };
  }
  const NPLQ = "NPLQ — National Pool Lifeguard Qualification";
  const FIRST_AID = "First Aid / AED";
  const POOL_PLANT = "Pool Plant Operations";
  const FIRE = "Fire Safety Awareness";
  const MANUAL = "Manual Handling";
  const SAFEGUARD = "Child Safeguarding";
  const SWIM = "Swim Teacher Qualification";

  // ---- Roles + required certs ----
  const role = (name: string, centerId: string | null, certs: string[]) =>
    db.staffRole.create({
      data: {
        name,
        centerId,
        active: true,
        requiredCertTypes: { connect: certs.map((n) => ({ id: certByName[n].id })) },
      },
    });
  const lifeguard = await role("Lifeguard", null, [NPLQ, FIRST_AID, SAFEGUARD]);
  const dutyManager = await role("Duty Manager", null, [FIRST_AID, FIRE, SAFEGUARD, MANUAL]);
  const swimTeacher = await role("Swim Teacher", null, [SWIM, SAFEGUARD, FIRST_AID]);
  const plantOperator = await role("Plant Operator", null, [POOL_PLANT, MANUAL]);

  // ---- Training programmes ----
  const induction = await db.trainingProgramme.create({
    data: {
      name: "Staff Induction",
      description: "Onboarding for all new staff — policies, NOP/EAP, site tour.",
      category: "INDUCTION",
      isOneTime: true,
      active: true,
      requiredForRoles: {
        connect: [lifeguard, dutyManager, swimTeacher, plantOperator].map((r) => ({ id: r.id })),
      },
    },
  });
  const manualHandlingProg = await db.trainingProgramme.create({
    data: {
      name: "Manual Handling Refresher",
      description: "Safe lifting and handling techniques.",
      category: "HEALTH_SAFETY",
      isOneTime: false,
      refreshIntervalMonths: 36,
      active: true,
      requiredForRoles: { connect: [dutyManager, plantOperator].map((r) => ({ id: r.id })) },
    },
  });
  const safeguardingProg = await db.trainingProgramme.create({
    data: {
      name: "Child Safeguarding Awareness",
      description: "Recognising and reporting child protection concerns.",
      category: "COMPLIANCE",
      isOneTime: false,
      refreshIntervalMonths: 24,
      active: true,
      requiredForRoles: { connect: [lifeguard, dutyManager, swimTeacher].map((r) => ({ id: r.id })) },
    },
  });

  // ---- Training modules (curriculum for two programmes) ----
  type SeedModule = {
    title: string;
    description: string;
    estimatedMinutes: number;
    hasAssessment: boolean;
    passMark: number | null;
    resources?: { kind: "LINK" | "FILE"; label: string; url: string }[];
  };
  const seedModules = async (programmeId: string, mods: SeedModule[]) => {
    for (const [i, m] of mods.entries()) {
      const { resources, ...rest } = m;
      await db.trainingModule.create({
        data: {
          programmeId,
          sortOrder: i + 1,
          ...rest,
          resources: resources?.length
            ? { create: resources.map((r) => ({ ...r, uploadedBy: "System" })) }
            : undefined,
        },
      });
    }
  };
  await seedModules(induction.id, [
    {
      title: "Welcome & company values",
      description: "Who we are, our mission and the LeisureWorld way of working.",
      estimatedMinutes: 20,
      hasAssessment: false,
      passMark: null,
    },
    {
      title: "Health & safety essentials",
      description:
        "NOP/EAP overview, hazard reporting and incident procedures. Assessed.",
      estimatedMinutes: 45,
      hasAssessment: true,
      passMark: 80,
      resources: [
        { kind: "LINK", label: "HSA workplace safety guide", url: "https://www.hsa.ie/" },
      ],
    },
    {
      title: "Site tour & facilities",
      description: "Layout, assembly points, plant room and staff areas.",
      estimatedMinutes: 30,
      hasAssessment: false,
      passMark: null,
    },
    {
      title: "Customer service standards",
      description: "Greeting members, handling queries and resolving complaints.",
      estimatedMinutes: 25,
      hasAssessment: false,
      passMark: null,
    },
  ]);
  await seedModules(safeguardingProg.id, [
    {
      title: "Recognising abuse",
      description: "The types of abuse and the signs to look out for.",
      estimatedMinutes: 30,
      hasAssessment: false,
      passMark: null,
    },
    {
      title: "Reporting concerns",
      description: "The reporting pathway and the Designated Liaison Person.",
      estimatedMinutes: 20,
      hasAssessment: true,
      passMark: 90,
    },
    {
      title: "Code of behaviour",
      description: "Appropriate conduct around children and young people.",
      estimatedMinutes: 20,
      hasAssessment: false,
      passMark: null,
    },
  ]);

  // ---- Helpers ----
  const mkStaff = (data: {
    firstName: string;
    lastName: string;
    centerId: string;
    roleId: string;
    status?: "ACTIVE" | "PROBATION" | "ON_LEAVE" | "INACTIVE";
    monthsAgo: number;
  }) =>
    db.staffMember.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: `${data.firstName}.${data.lastName}`.toLowerCase() + "@leisureworld.ie",
        phone: "021 000 0000",
        centerId: data.centerId,
        roleId: data.roleId,
        status: data.status ?? "ACTIVE",
        startDate: subMonths(now, data.monthsAgo),
      },
    });

  const mkCert = (
    staffId: string,
    name: string,
    issue: Date,
    opts: { number?: string; expiry?: Date } = {},
  ) =>
    db.certRecord.create({
      data: {
        staffId,
        certTypeId: certByName[name].id,
        certNumber: opts.number ?? "",
        issueDate: issue,
        expiryDate: opts.expiry ?? addMonths(issue, certByName[name].validityMonths),
        recordedBy: "Seed import",
      },
    });

  const mkAbsence = (
    staffId: string,
    type:
      | "SICK_UNCERTIFIED"
      | "SICK_CERTIFIED"
      | "UNAUTHORISED"
      | "ANNUAL_LEAVE"
      | "PARENTAL_LEAVE"
      | "BEREAVEMENT"
      | "OTHER",
    start: Date,
    days: number,
    opts: { reason?: string; rtw?: boolean } = {},
  ) =>
    db.absenceRecord.create({
      data: {
        staffId,
        type,
        startDate: start,
        endDate: addDays(start, days - 1),
        daysCount: days,
        reason: opts.reason ?? "",
        approvedBy: "Duty Manager",
        returnToWorkCompletedAt: opts.rtw ? addDays(start, days) : null,
        returnToWorkNote: opts.rtw ? "RTW interview completed." : "",
      },
    });

  // ---- Staff ----
  const aoife = await mkStaff({ firstName: "Aoife", lastName: "Byrne", centerId: cork.id, roleId: lifeguard.id, monthsAgo: 30 });
  const cian = await mkStaff({ firstName: "Cian", lastName: "Murphy", centerId: mahon.id, roleId: lifeguard.id, monthsAgo: 18 });
  const niamh = await mkStaff({ firstName: "Niamh", lastName: "OBrien", centerId: cork.id, roleId: dutyManager.id, monthsAgo: 54 });
  const liam = await mkStaff({ firstName: "Liam", lastName: "Walsh", centerId: ballincollig.id, roleId: plantOperator.id, monthsAgo: 40 });
  const saoirse = await mkStaff({ firstName: "Saoirse", lastName: "Kelly", centerId: cork.id, roleId: swimTeacher.id, monthsAgo: 22 });
  const darragh = await mkStaff({ firstName: "Darragh", lastName: "Ryan", centerId: ballincollig.id, roleId: lifeguard.id, status: "PROBATION", monthsAgo: 2 });
  const emma = await mkStaff({ firstName: "Emma", lastName: "Doyle", centerId: mahon.id, roleId: swimTeacher.id, monthsAgo: 14 });
  const conor = await mkStaff({ firstName: "Conor", lastName: "McCarthy", centerId: mahon.id, roleId: dutyManager.id, status: "ON_LEAVE", monthsAgo: 60 });

  // ---- Certifications (2 expired, 3 expiring ≤90d, rest valid) ----
  await mkCert(aoife.id, NPLQ, subMonths(now, 25), { number: "NPLQ-4471" }); // EXPIRED
  await mkCert(aoife.id, FIRST_AID, subMonths(now, 6), { number: "FA-2231" });
  await mkCert(aoife.id, SAFEGUARD, subMonths(now, 4));

  await mkCert(cian.id, NPLQ, subMonths(now, 8), { number: "NPLQ-5120" });
  await mkCert(cian.id, FIRST_AID, subDays(now, 642), { number: "FA-3398" }); // EXPIRING ~88d
  await mkCert(cian.id, SAFEGUARD, subMonths(now, 10));

  await mkCert(niamh.id, FIRST_AID, subMonths(now, 5));
  await mkCert(niamh.id, FIRE, subDays(now, 345), { number: "FS-1180" }); // EXPIRING ~20d
  await mkCert(niamh.id, SAFEGUARD, subMonths(now, 3));
  await mkCert(niamh.id, MANUAL, subMonths(now, 7));

  await mkCert(liam.id, POOL_PLANT, subDays(now, 1055), { number: "PPO-7741" }); // EXPIRING ~40d
  await mkCert(liam.id, MANUAL, subMonths(now, 9));

  await mkCert(saoirse.id, SWIM, subMonths(now, 10), { number: "STA-9921" });
  await mkCert(saoirse.id, SAFEGUARD, subMonths(now, 2));
  await mkCert(saoirse.id, FIRST_AID, subMonths(now, 1));

  await mkCert(darragh.id, NPLQ, subMonths(now, 26), { number: "NPLQ-6012" }); // EXPIRED
  await mkCert(darragh.id, FIRST_AID, subMonths(now, 2));

  await mkCert(emma.id, SWIM, subMonths(now, 6), { number: "SI-3340" });
  await mkCert(emma.id, SAFEGUARD, subMonths(now, 5));
  await mkCert(emma.id, FIRST_AID, subMonths(now, 8));

  await mkCert(conor.id, FIRST_AID, subMonths(now, 3));
  await mkCert(conor.id, FIRE, subMonths(now, 2));
  await mkCert(conor.id, SAFEGUARD, subMonths(now, 4));
  await mkCert(conor.id, MANUAL, subMonths(now, 6));

  // ---- Absences (amber Bradford for Aoife 54, Cian 48, Darragh 64) ----
  await mkAbsence(aoife.id, "SICK_UNCERTIFIED", subMonths(now, 2), 2, { reason: "Migraine", rtw: true });
  await mkAbsence(aoife.id, "SICK_CERTIFIED", subMonths(now, 5), 2, { reason: "Flu", rtw: true });
  await mkAbsence(aoife.id, "SICK_UNCERTIFIED", subMonths(now, 8), 2, { reason: "Stomach bug" });
  await mkAbsence(aoife.id, "ANNUAL_LEAVE", subMonths(now, 3), 5);

  await mkAbsence(cian.id, "SICK_CERTIFIED", subMonths(now, 1), 6, { reason: "Back injury", rtw: true });
  await mkAbsence(cian.id, "SICK_UNCERTIFIED", subMonths(now, 6), 6, { reason: "Chest infection" });

  await mkAbsence(darragh.id, "SICK_UNCERTIFIED", subDays(now, 12), 1);
  await mkAbsence(darragh.id, "SICK_UNCERTIFIED", subMonths(now, 1), 1);
  await mkAbsence(darragh.id, "UNAUTHORISED", subMonths(now, 1), 1, { reason: "No-show" });
  await mkAbsence(darragh.id, "SICK_UNCERTIFIED", subDays(now, 40), 1);

  await mkAbsence(saoirse.id, "ANNUAL_LEAVE", subMonths(now, 2), 5);
  await mkAbsence(emma.id, "SICK_CERTIFIED", subMonths(now, 4), 2, { reason: "Tonsillitis", rtw: true });
  await mkAbsence(conor.id, "PARENTAL_LEAVE", subMonths(now, 1), 20, { reason: "Parental leave" });

  // ---- Training (mix: completed / in-progress / overdue) ----
  const train = (
    staffId: string,
    programmeId: string | null,
    title: string,
    category:
      | "INDUCTION"
      | "HEALTH_SAFETY"
      | "ROLE_SPECIFIC"
      | "LEADERSHIP"
      | "COMPLIANCE"
      | "CUSTOMER_SERVICE"
      | "OTHER",
    opts: {
      outcome?: "PASS" | "FAIL" | "ATTENDED" | "IN_PROGRESS" | "PENDING";
      monthsAgo?: number;
      expiry?: Date | null;
      delivery?: "IN_PERSON" | "ONLINE" | "EXTERNAL_COURSE" | "SHADOWING" | "E_LEARNING";
    } = {},
  ) =>
    db.trainingRecord.create({
      data: {
        staffId,
        programmeId,
        title,
        category,
        delivery: opts.delivery ?? "IN_PERSON",
        deliveredBy: "Centre trainer",
        completedDate: subMonths(now, opts.monthsAgo ?? 3),
        durationHours: 3,
        outcome: opts.outcome ?? "PASS",
        expiryDate: opts.expiry ?? null,
        recordedBy: "Seed import",
      },
    });

  await train(aoife.id, induction.id, "Staff Induction", "INDUCTION", { monthsAgo: 29 });
  await train(aoife.id, safeguardingProg.id, "Child Safeguarding Awareness", "COMPLIANCE", { monthsAgo: 4, expiry: addMonths(now, 20) });
  await train(cian.id, induction.id, "Staff Induction", "INDUCTION", { monthsAgo: 17 });
  await train(cian.id, safeguardingProg.id, "Child Safeguarding Awareness", "COMPLIANCE", { monthsAgo: 26, expiry: subMonths(now, 2) }); // OVERDUE
  await train(liam.id, manualHandlingProg.id, "Manual Handling Refresher", "HEALTH_SAFETY", { monthsAgo: 9, expiry: addMonths(now, 27) });
  await train(darragh.id, induction.id, "Staff Induction", "INDUCTION", { outcome: "IN_PROGRESS", monthsAgo: 1, delivery: "SHADOWING" });
  await train(saoirse.id, induction.id, "Staff Induction", "INDUCTION", { monthsAgo: 21 });
  await train(saoirse.id, null, "Pool rescue scenarios workshop", "ROLE_SPECIFIC", { outcome: "ATTENDED", monthsAgo: 2 });
  await train(niamh.id, null, "Leading effective teams", "LEADERSHIP", { outcome: "PASS", monthsAgo: 5, delivery: "EXTERNAL_COURSE" });

  // ---- Performance notes (1 positive, 1 concern) ----
  await db.performanceNote.create({
    data: {
      staffId: saoirse.id,
      category: "POSITIVE",
      title: "Outstanding learn-to-swim feedback",
      body: "Parents have repeatedly praised Saoirse's patience and the progress of the Tuesday beginners group. Great ambassador for the centre.",
      visibility: "SHARED_WITH_STAFF",
      createdBy: "Site Manager",
      noteDate: subMonths(now, 1),
    },
  });
  await db.performanceNote.create({
    data: {
      staffId: cian.id,
      category: "CONCERN",
      title: "Punctuality on early shifts",
      body: "Cian has been late opening the pool on three early shifts this month. Discussed informally; monitoring over the next month.",
      visibility: "MANAGER_ONLY",
      createdBy: "Duty Manager",
      noteDate: subDays(now, 20),
    },
  });

  // ---- Disciplinary (1 open verbal warning) ----
  await db.disciplinaryRecord.create({
    data: {
      staffId: darragh.id,
      stage: "VERBAL_WARNING",
      status: "OPEN",
      incidentDate: subMonths(now, 1),
      meetingDate: subDays(now, 25),
      reviewDate: addMonths(now, 2),
      description:
        "Failure to attend a rostered shift without notice on a busy Saturday, leaving the pool short-staffed.",
      outcome:
        "Verbal warning issued. Importance of giving notice and the absence procedure reiterated. To be reviewed in 3 months.",
      managedBy: "Site Manager",
      witnessPresent: true,
      witnessName: "Niamh O'Brien",
      staffAcknowledged: true,
    },
  });

  const [centres, staffCount, certCount, absenceCount, trainingCount] = await Promise.all([
    db.center.count(),
    db.staffMember.count(),
    db.certRecord.count(),
    db.absenceRecord.count(),
    db.trainingRecord.count(),
  ]);
  console.log(
    `Staffly seeded: ${centres} centres, ${staffCount} staff, ${certCount} certs, ${absenceCount} absences, ${trainingCount} training records.`,
  );
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
