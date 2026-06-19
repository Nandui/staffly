-- DropForeignKey
ALTER TABLE "Area" DROP CONSTRAINT "Area_centerId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_assessmentId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "Hazard" DROP CONSTRAINT "Hazard_assessmentId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewLog" DROP CONSTRAINT "ReviewLog_assessmentId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewRequest" DROP CONSTRAINT "ReviewRequest_assessmentId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewRequest" DROP CONSTRAINT "ReviewRequest_requestedById_fkey";

-- DropForeignKey
ALTER TABLE "ReviewRequest" DROP CONSTRAINT "ReviewRequest_resolvedById_fkey";

-- DropForeignKey
ALTER TABLE "RiskAssessment" DROP CONSTRAINT "RiskAssessment_activityId_fkey";

-- DropForeignKey
ALTER TABLE "RiskAssessment" DROP CONSTRAINT "RiskAssessment_approvedById_fkey";

-- DropForeignKey
ALTER TABLE "RiskAssessment" DROP CONSTRAINT "RiskAssessment_areaId_fkey";

-- DropForeignKey
ALTER TABLE "RiskAssessment" DROP CONSTRAINT "RiskAssessment_centerId_fkey";

-- DropForeignKey
ALTER TABLE "RiskAssessment" DROP CONSTRAINT "RiskAssessment_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "RiskAssessment" DROP CONSTRAINT "RiskAssessment_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "RiskAssessment" DROP CONSTRAINT "RiskAssessment_roleId_fkey";

-- DropTable
DROP TABLE "Activity";

-- DropTable
DROP TABLE "Area";

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "Department";

-- DropTable
DROP TABLE "Hazard";

-- DropTable
DROP TABLE "ReviewLog";

-- DropTable
DROP TABLE "ReviewRequest";

-- DropTable
DROP TABLE "RiskAssessment";

-- DropTable
DROP TABLE "Role";

