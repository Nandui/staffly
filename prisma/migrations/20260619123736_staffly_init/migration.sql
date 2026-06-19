-- CreateEnum
CREATE TYPE "StaffStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'PROBATION');

-- CreateEnum
CREATE TYPE "AbsenceType" AS ENUM ('SICK_UNCERTIFIED', 'SICK_CERTIFIED', 'UNAUTHORISED', 'ANNUAL_LEAVE', 'PARENTAL_LEAVE', 'BEREAVEMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "PerformanceNoteCategory" AS ENUM ('POSITIVE', 'CONCERN', 'FORMAL', 'OBJECTIVE', 'REVIEW');

-- CreateEnum
CREATE TYPE "PerformanceNoteVisibility" AS ENUM ('MANAGER_ONLY', 'SHARED_WITH_STAFF');

-- CreateEnum
CREATE TYPE "DisciplinaryStage" AS ENUM ('VERBAL_WARNING', 'WRITTEN_WARNING', 'FINAL_WRITTEN_WARNING', 'SUSPENSION', 'DISMISSAL');

-- CreateEnum
CREATE TYPE "DisciplinaryStatus" AS ENUM ('OPEN', 'RESOLVED', 'APPEALED');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('CONTRACT', 'GARDA_VETTING', 'RIGHT_TO_WORK', 'CERT', 'DISCIPLINARY', 'TRAINING', 'OTHER');

-- CreateEnum
CREATE TYPE "TrainingCategory" AS ENUM ('INDUCTION', 'HEALTH_SAFETY', 'ROLE_SPECIFIC', 'LEADERSHIP', 'COMPLIANCE', 'CUSTOMER_SERVICE', 'OTHER');

-- CreateEnum
CREATE TYPE "TrainingDelivery" AS ENUM ('IN_PERSON', 'ONLINE', 'EXTERNAL_COURSE', 'SHADOWING', 'E_LEARNING');

-- CreateEnum
CREATE TYPE "TrainingOutcome" AS ENUM ('PASS', 'FAIL', 'ATTENDED', 'IN_PROGRESS', 'PENDING');

-- CreateTable
CREATE TABLE "StaffMember" (
    "id" TEXT NOT NULL,
    "centerId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "photo" TEXT,
    "roleId" TEXT,
    "status" "StaffStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffRole" (
    "id" TEXT NOT NULL,
    "centerId" TEXT,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbsenceRecord" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "type" "AbsenceType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "daysCount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL DEFAULT '',
    "certProvided" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT NOT NULL,
    "returnToWorkNote" TEXT NOT NULL DEFAULT '',
    "returnToWorkCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AbsenceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceNote" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "category" "PerformanceNoteCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "visibility" "PerformanceNoteVisibility" NOT NULL DEFAULT 'MANAGER_ONLY',
    "createdBy" TEXT NOT NULL,
    "noteDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisciplinaryRecord" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "stage" "DisciplinaryStage" NOT NULL,
    "status" "DisciplinaryStatus" NOT NULL DEFAULT 'OPEN',
    "meetingDate" TIMESTAMP(3) NOT NULL,
    "incidentDate" TIMESTAMP(3) NOT NULL,
    "reviewDate" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "managedBy" TEXT NOT NULL,
    "witnessPresent" BOOLEAN NOT NULL DEFAULT false,
    "witnessName" TEXT,
    "staffAcknowledged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DisciplinaryRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffDocument" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "name" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSizeKb" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "notes" TEXT NOT NULL DEFAULT '',
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuingBody" TEXT NOT NULL,
    "validityMonths" INTEGER NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "isBuiltIn" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CertType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertRecord" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "certTypeId" TEXT NOT NULL,
    "certNumber" TEXT NOT NULL DEFAULT '',
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "documentId" TEXT,
    "notes" TEXT NOT NULL DEFAULT '',
    "recordedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CertRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingProgramme" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" "TrainingCategory" NOT NULL,
    "isOneTime" BOOLEAN NOT NULL DEFAULT true,
    "refreshIntervalMonths" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingProgramme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingRecord" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "programmeId" TEXT,
    "title" TEXT NOT NULL,
    "category" "TrainingCategory" NOT NULL,
    "delivery" "TrainingDelivery" NOT NULL,
    "deliveredBy" TEXT NOT NULL,
    "completedDate" TIMESTAMP(3) NOT NULL,
    "durationHours" DOUBLE PRECISION NOT NULL,
    "outcome" "TrainingOutcome" NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "notes" TEXT NOT NULL DEFAULT '',
    "documentId" TEXT,
    "recordedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProgrammeRequiredRoles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProgrammeRequiredRoles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RoleRequiredCerts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RoleRequiredCerts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "StaffMember_centerId_idx" ON "StaffMember"("centerId");

-- CreateIndex
CREATE INDEX "StaffMember_status_idx" ON "StaffMember"("status");

-- CreateIndex
CREATE INDEX "AbsenceRecord_staffId_idx" ON "AbsenceRecord"("staffId");

-- CreateIndex
CREATE INDEX "PerformanceNote_staffId_idx" ON "PerformanceNote"("staffId");

-- CreateIndex
CREATE INDEX "DisciplinaryRecord_staffId_idx" ON "DisciplinaryRecord"("staffId");

-- CreateIndex
CREATE INDEX "DisciplinaryRecord_status_idx" ON "DisciplinaryRecord"("status");

-- CreateIndex
CREATE INDEX "StaffDocument_staffId_idx" ON "StaffDocument"("staffId");

-- CreateIndex
CREATE INDEX "CertRecord_staffId_idx" ON "CertRecord"("staffId");

-- CreateIndex
CREATE INDEX "CertRecord_expiryDate_idx" ON "CertRecord"("expiryDate");

-- CreateIndex
CREATE INDEX "TrainingRecord_staffId_idx" ON "TrainingRecord"("staffId");

-- CreateIndex
CREATE INDEX "_ProgrammeRequiredRoles_B_index" ON "_ProgrammeRequiredRoles"("B");

-- CreateIndex
CREATE INDEX "_RoleRequiredCerts_B_index" ON "_RoleRequiredCerts"("B");

-- AddForeignKey
ALTER TABLE "StaffMember" ADD CONSTRAINT "StaffMember_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffMember" ADD CONSTRAINT "StaffMember_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "StaffRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffRole" ADD CONSTRAINT "StaffRole_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbsenceRecord" ADD CONSTRAINT "AbsenceRecord_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceNote" ADD CONSTRAINT "PerformanceNote_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplinaryRecord" ADD CONSTRAINT "DisciplinaryRecord_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffDocument" ADD CONSTRAINT "StaffDocument_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertRecord" ADD CONSTRAINT "CertRecord_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertRecord" ADD CONSTRAINT "CertRecord_certTypeId_fkey" FOREIGN KEY ("certTypeId") REFERENCES "CertType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRecord" ADD CONSTRAINT "TrainingRecord_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "TrainingProgramme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProgrammeRequiredRoles" ADD CONSTRAINT "_ProgrammeRequiredRoles_A_fkey" FOREIGN KEY ("A") REFERENCES "StaffRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProgrammeRequiredRoles" ADD CONSTRAINT "_ProgrammeRequiredRoles_B_fkey" FOREIGN KEY ("B") REFERENCES "TrainingProgramme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleRequiredCerts" ADD CONSTRAINT "_RoleRequiredCerts_A_fkey" FOREIGN KEY ("A") REFERENCES "CertType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleRequiredCerts" ADD CONSTRAINT "_RoleRequiredCerts_B_fkey" FOREIGN KEY ("B") REFERENCES "StaffRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
