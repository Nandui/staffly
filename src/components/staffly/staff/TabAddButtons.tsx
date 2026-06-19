"use client";

import {
  CalendarOff,
  ShieldCheck,
  GraduationCap,
  MessageSquarePlus,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormSheet } from "@/components/staffly/shared/FormSheet";
import { AbsenceForm } from "@/components/staffly/absence/AbsenceForm";
import { CertForm } from "@/components/staffly/certifications/CertForm";
import { TrainingForm } from "@/components/staffly/training/TrainingForm";
import { PerformanceNoteForm } from "@/components/staffly/performance/PerformanceNoteForm";
import { DocumentUploadForm } from "@/components/staffly/documents/DocumentUploadForm";

interface CertTypeOption {
  id: string;
  name: string;
  issuingBody: string;
  validityMonths: number;
}
interface ProgrammeOption {
  id: string;
  name: string;
  category: string;
  isOneTime: boolean;
  refreshIntervalMonths: number | null;
  modules: {
    id: string;
    title: string;
    hasAssessment: boolean;
    passMark: number | null;
    completed: boolean;
  }[];
}

export function AddAbsenceButton({ staffId }: { staffId: string }) {
  return (
    <FormSheet
      title="Log absence"
      description="Record an absence — sickness counts toward the Bradford Factor."
      trigger={
        <Button size="sm">
          <CalendarOff className="size-4" /> Log absence
        </Button>
      }
    >
      {({ close }) => <AbsenceForm staffId={staffId} onSuccess={close} />}
    </FormSheet>
  );
}

export function AddCertButton({
  staffId,
  certTypes,
}: {
  staffId: string;
  certTypes: CertTypeOption[];
}) {
  return (
    <FormSheet
      title="Add certification"
      description="Record a qualification or licence and its expiry."
      trigger={
        <Button size="sm">
          <ShieldCheck className="size-4" /> Add cert
        </Button>
      }
    >
      {({ close }) => (
        <CertForm staffId={staffId} certTypes={certTypes} onSuccess={close} />
      )}
    </FormSheet>
  );
}

export function LogTrainingButton({
  staffId,
  programmes,
}: {
  staffId: string;
  programmes: ProgrammeOption[];
}) {
  return (
    <FormSheet
      title="Log training"
      description="Record completed training from the library or ad hoc."
      trigger={
        <Button size="sm">
          <GraduationCap className="size-4" /> Log training
        </Button>
      }
    >
      {({ close }) => (
        <TrainingForm staffId={staffId} programmes={programmes} onSuccess={close} />
      )}
    </FormSheet>
  );
}

export function AddNoteButton({ staffId }: { staffId: string }) {
  return (
    <FormSheet
      title="Add performance note"
      trigger={
        <Button size="sm">
          <MessageSquarePlus className="size-4" /> Add note
        </Button>
      }
    >
      {({ close }) => <PerformanceNoteForm staffId={staffId} onSuccess={close} />}
    </FormSheet>
  );
}

export function UploadDocButton({ staffId }: { staffId: string }) {
  return (
    <FormSheet
      title="Upload document"
      description="PDF, image or Word doc — up to 5MB."
      trigger={
        <Button size="sm">
          <Upload className="size-4" /> Upload
        </Button>
      }
    >
      {({ close }) => <DocumentUploadForm staffId={staffId} onSuccess={close} />}
    </FormSheet>
  );
}
