-- CreateTable
CREATE TABLE "CertNotificationAck" (
    "id" TEXT NOT NULL,
    "certRecordId" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "acknowledgedBy" TEXT NOT NULL,
    "acknowledgedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CertNotificationAck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CertNotificationAck_certRecordId_priority_key" ON "CertNotificationAck"("certRecordId", "priority");
