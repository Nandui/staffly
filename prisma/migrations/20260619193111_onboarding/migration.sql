-- CreateEnum
CREATE TYPE "OnboardingCategory" AS ENUM ('PAPERWORK', 'VETTING', 'TRAINING', 'ACCESS', 'EQUIPMENT', 'REVIEW', 'OTHER');

-- CreateTable
CREATE TABLE "OnboardingStep" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" "OnboardingCategory" NOT NULL DEFAULT 'PAPERWORK',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "roleId" TEXT,
    "dueOffsetDays" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingCompletion" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "completedDate" TIMESTAMP(3) NOT NULL,
    "completedBy" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OnboardingStep_roleId_idx" ON "OnboardingStep"("roleId");

-- CreateIndex
CREATE INDEX "OnboardingCompletion_staffId_idx" ON "OnboardingCompletion"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingCompletion_stepId_staffId_key" ON "OnboardingCompletion"("stepId", "staffId");

-- AddForeignKey
ALTER TABLE "OnboardingStep" ADD CONSTRAINT "OnboardingStep_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "StaffRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingCompletion" ADD CONSTRAINT "OnboardingCompletion_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "OnboardingStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingCompletion" ADD CONSTRAINT "OnboardingCompletion_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
