-- CreateEnum
CREATE TYPE "ResourceKind" AS ENUM ('LINK', 'FILE');

-- CreateTable
CREATE TABLE "TrainingModule" (
    "id" TEXT NOT NULL,
    "programmeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "estimatedMinutes" INTEGER,
    "hasAssessment" BOOLEAN NOT NULL DEFAULT false,
    "passMark" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingModuleResource" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "kind" "ResourceKind" NOT NULL DEFAULT 'LINK',
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT,
    "fileType" TEXT,
    "fileSizeKb" INTEGER,
    "uploadedBy" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingModuleResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingModuleCompletion" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "completedDate" TIMESTAMP(3) NOT NULL,
    "score" INTEGER,
    "passed" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT NOT NULL DEFAULT '',
    "recordedBy" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingModuleCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainingModule_programmeId_idx" ON "TrainingModule"("programmeId");

-- CreateIndex
CREATE INDEX "TrainingModuleResource_moduleId_idx" ON "TrainingModuleResource"("moduleId");

-- CreateIndex
CREATE INDEX "TrainingModuleCompletion_staffId_idx" ON "TrainingModuleCompletion"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingModuleCompletion_moduleId_staffId_key" ON "TrainingModuleCompletion"("moduleId", "staffId");

-- AddForeignKey
ALTER TABLE "TrainingModule" ADD CONSTRAINT "TrainingModule_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "TrainingProgramme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingModuleResource" ADD CONSTRAINT "TrainingModuleResource_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "TrainingModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingModuleCompletion" ADD CONSTRAINT "TrainingModuleCompletion_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "TrainingModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingModuleCompletion" ADD CONSTRAINT "TrainingModuleCompletion_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
