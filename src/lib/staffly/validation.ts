import { z } from "zod";

// Shared helpers ------------------------------------------------------------

const text = (max: number) => z.string().trim().max(max);
const optText = (max: number) => z.string().trim().max(max).optional().default("");

// FormData booleans: checkboxes send "on" when checked / nothing when not;
// radios send "true"/"false". z.coerce.boolean treats any non-empty string as
// true, so parse explicitly.
const boolField = z.preprocess((v) => {
  if (typeof v === "boolean") return v;
  return v === "true" || v === "on" || v === "1";
}, z.boolean());

const dateStr = z
  .string()
  .trim()
  .min(1, "Required")
  .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date");

const optDateStr = z
  .union([dateStr, z.literal("")])
  .optional()
  .transform((v) => (v ? v : undefined));

const id = z.string().min(1);

// Optional integer from FormData: "" / missing → null, else coerce + bound.
// (Pre-checking "" avoids z.coerce turning empty strings into 0.)
const optInt = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? null : v),
    z.coerce.number().int().min(min).max(max).nullable(),
  );

// Staff ---------------------------------------------------------------------

export const staffSchema = z
  .object({
    firstName: text(80).min(1, "First name is required"),
    lastName: text(80).min(1, "Last name is required"),
    email: z.string().trim().email("Enter a valid email").max(160),
    phone: optText(40),
    centerId: id.min(1, "Select a centre"),
    roleId: z.string().optional().default(""),
    status: z.enum(["ACTIVE", "INACTIVE", "ON_LEAVE", "PROBATION"]),
    startDate: dateStr,
    endDate: optDateStr,
    notes: optText(4000),
  })
  .refine(
    (d) => d.status !== "INACTIVE" || !!d.endDate,
    { path: ["endDate"], message: "Set an end date for inactive staff" },
  );
export type StaffInput = z.infer<typeof staffSchema>;

// Absence -------------------------------------------------------------------

export const addAbsenceSchema = z
  .object({
    staffId: id,
    type: z.enum([
      "SICK_UNCERTIFIED",
      "SICK_CERTIFIED",
      "UNAUTHORISED",
      "ANNUAL_LEAVE",
      "PARENTAL_LEAVE",
      "BEREAVEMENT",
      "OTHER",
    ]),
    startDate: dateStr,
    endDate: dateStr,
    daysCount: z.coerce.number().int().min(1, "At least one day"),
    reason: optText(2000),
    certProvided: boolField,
    approvedBy: text(120).min(1, "Who approved this?"),
  })
  .refine((d) => Date.parse(d.endDate) >= Date.parse(d.startDate), {
    path: ["endDate"],
    message: "End date can't be before the start date",
  });
export type AddAbsenceInput = z.infer<typeof addAbsenceSchema>;

export const rtwSchema = z.object({
  absenceId: id,
  rtwDate: dateStr,
  conductedBy: text(120).min(1, "Who conducted the interview?"),
  account: optText(4000),
  furtherAction: optText(2000),
});
export type RtwInput = z.infer<typeof rtwSchema>;

// Performance ---------------------------------------------------------------

export const performanceNoteSchema = z.object({
  staffId: id,
  category: z.enum(["POSITIVE", "CONCERN", "FORMAL", "OBJECTIVE", "REVIEW"]),
  title: text(160).min(1, "Add a title"),
  body: text(8000).min(1, "Add some detail"),
  visibility: z.enum(["MANAGER_ONLY", "SHARED_WITH_STAFF"]),
  noteDate: dateStr,
});
export type PerformanceNoteInput = z.infer<typeof performanceNoteSchema>;

// Disciplinary --------------------------------------------------------------

export const disciplinarySchema = z.object({
  staffId: id,
  stage: z.enum([
    "VERBAL_WARNING",
    "WRITTEN_WARNING",
    "FINAL_WRITTEN_WARNING",
    "SUSPENSION",
    "DISMISSAL",
  ]),
  status: z.enum(["OPEN", "RESOLVED", "APPEALED"]),
  meetingDate: dateStr,
  incidentDate: dateStr,
  reviewDate: optDateStr,
  description: text(8000).min(1, "Describe the matter"),
  outcome: text(8000).min(1, "Record the outcome"),
  managedBy: text(120).min(1, "Who managed this?"),
  witnessPresent: boolField,
  witnessName: optText(120),
  staffAcknowledged: boolField,
});
export type DisciplinaryInput = z.infer<typeof disciplinarySchema>;

// Documents -----------------------------------------------------------------

export const documentSchema = z.object({
  staffId: id,
  name: text(160).min(1, "Add a name"),
  category: z.enum([
    "CONTRACT",
    "GARDA_VETTING",
    "RIGHT_TO_WORK",
    "CERT",
    "DISCIPLINARY",
    "TRAINING",
    "OTHER",
  ]),
  fileUrl: z.string().url("Upload a file first"),
  filename: text(260).min(1),
  fileSizeKb: z.coerce.number().int().min(0),
  fileType: text(120).default(""),
  expiryDate: optDateStr,
  notes: optText(2000),
});
export type DocumentInput = z.infer<typeof documentSchema>;

// Certifications ------------------------------------------------------------

export const addCertRecordSchema = z
  .object({
    staffId: id,
    certTypeId: id.min(1, "Choose a cert type"),
    certNumber: optText(100),
    issueDate: dateStr,
    expiryDate: dateStr,
    notes: optText(2000),
    documentId: z.string().optional().default(""),
  })
  .refine((d) => Date.parse(d.expiryDate) >= Date.parse(d.issueDate), {
    path: ["expiryDate"],
    message: "Expiry can't be before the issue date",
  });
export type AddCertRecordInput = z.infer<typeof addCertRecordSchema>;

export const certTypeSchema = z.object({
  name: text(160).min(2, "Name is required"),
  issuingBody: text(160).min(1, "Issuing body is required"),
  validityMonths: z.coerce.number().int().min(1).max(600),
  description: optText(2000),
});
export type CertTypeInput = z.infer<typeof certTypeSchema>;

// Roles ---------------------------------------------------------------------

export const staffRoleSchema = z.object({
  name: text(120).min(2, "Name is required"),
  centerId: z.string().optional().default(""),
  active: boolField,
  requiredCertTypeIds: z.array(z.string()).default([]),
});
export type StaffRoleInput = z.infer<typeof staffRoleSchema>;

// Training ------------------------------------------------------------------

export const trainingRecordSchema = z.object({
  staffId: id,
  programmeId: z.string().optional().default(""),
  title: text(200).min(1, "Add a title"),
  category: z.enum([
    "INDUCTION",
    "HEALTH_SAFETY",
    "ROLE_SPECIFIC",
    "LEADERSHIP",
    "COMPLIANCE",
    "CUSTOMER_SERVICE",
    "OTHER",
  ]),
  delivery: z.enum([
    "IN_PERSON",
    "ONLINE",
    "EXTERNAL_COURSE",
    "SHADOWING",
    "E_LEARNING",
  ]),
  deliveredBy: text(160).min(1, "Who delivered it?"),
  completedDate: dateStr,
  durationHours: z.coerce.number().min(0).max(1000),
  outcome: z.enum(["PASS", "FAIL", "ATTENDED", "IN_PROGRESS", "PENDING"]),
  expiryDate: optDateStr,
  notes: optText(2000),
  documentId: z.string().optional().default(""),
});
export type TrainingRecordInput = z.infer<typeof trainingRecordSchema>;

export const trainingProgrammeSchema = z.object({
  name: text(200).min(2, "Name is required"),
  description: optText(2000),
  category: z.enum([
    "INDUCTION",
    "HEALTH_SAFETY",
    "ROLE_SPECIFIC",
    "LEADERSHIP",
    "COMPLIANCE",
    "CUSTOMER_SERVICE",
    "OTHER",
  ]),
  requiredForRoleIds: z.array(z.string()).default([]),
  isOneTime: boolField,
  refreshIntervalMonths: z
    .union([z.coerce.number().int().min(1).max(120), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  active: boolField,
});
export type TrainingProgrammeInput = z.infer<typeof trainingProgrammeSchema>;

// Training modules ----------------------------------------------------------

export const trainingModuleSchema = z.object({
  programmeId: id,
  title: text(200).min(2, "Add a title"),
  description: optText(8000),
  estimatedMinutes: optInt(1, 100000),
  hasAssessment: boolField,
  passMark: optInt(0, 100),
});
export type TrainingModuleInput = z.infer<typeof trainingModuleSchema>;

export const moduleResourceSchema = z.object({
  moduleId: id,
  label: text(200).min(1, "Add a label"),
  url: z
    .union([z.string().trim().url("Enter a valid URL"), z.literal("")])
    .optional()
    .default(""),
});
export type ModuleResourceInput = z.infer<typeof moduleResourceSchema>;

export const moduleCompletionSchema = z.object({
  moduleId: id,
  staffId: id,
  completedDate: dateStr,
  score: optInt(0, 100),
  passed: boolField,
  notes: optText(2000),
});
export type ModuleCompletionInput = z.infer<typeof moduleCompletionSchema>;

// Onboarding ----------------------------------------------------------------

export const onboardingStepSchema = z.object({
  title: text(200).min(2, "Add a title"),
  description: optText(2000),
  category: z.enum([
    "PAPERWORK",
    "VETTING",
    "TRAINING",
    "ACCESS",
    "EQUIPMENT",
    "REVIEW",
    "OTHER",
  ]),
  roleId: z.string().optional().default(""),
  dueOffsetDays: optInt(0, 3650),
  active: boolField,
});
export type OnboardingStepInput = z.infer<typeof onboardingStepSchema>;

// Centres ------------------------------------------------------------------

export const centreSchema = z.object({
  name: text(120).min(2, "Name is required"),
  address: optText(300),
  contactName: optText(120),
  contactEmail: z
    .union([z.string().trim().email("Enter a valid email").max(160), z.literal("")])
    .optional()
    .default(""),
  phone: optText(50),
  notes: optText(2000),
  active: boolField,
});
export type CentreInput = z.infer<typeof centreSchema>;
