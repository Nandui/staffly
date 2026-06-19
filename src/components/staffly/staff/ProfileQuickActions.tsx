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
import { EditStaffSheet } from "@/components/staffly/staff/EditStaffSheet";
import type { StaffFormValues } from "@/components/staffly/staff/StaffForm";

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

export function ProfileQuickActions({
  staffId,
  staff,
  centers,
  roles,
  certTypes,
  programmes,
}: {
  staffId: string;
  staff: StaffFormValues;
  centers: { id: string; name: string }[];
  roles: { id: string; name: string }[];
  certTypes: CertTypeOption[];
  programmes: ProgrammeOption[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
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

      <FormSheet
        title="Add certification"
        description="Record a qualification or licence and its expiry."
        trigger={
          <Button variant="outline" size="sm">
            <ShieldCheck className="size-4" /> Cert
          </Button>
        }
      >
        {({ close }) => (
          <CertForm staffId={staffId} certTypes={certTypes} onSuccess={close} />
        )}
      </FormSheet>

      <FormSheet
        title="Log training"
        description="Record completed training from the library or ad hoc."
        trigger={
          <Button variant="outline" size="sm">
            <GraduationCap className="size-4" /> Training
          </Button>
        }
      >
        {({ close }) => (
          <TrainingForm staffId={staffId} programmes={programmes} onSuccess={close} />
        )}
      </FormSheet>

      <FormSheet
        title="Add performance note"
        trigger={
          <Button variant="outline" size="sm">
            <MessageSquarePlus className="size-4" /> Note
          </Button>
        }
      >
        {({ close }) => (
          <PerformanceNoteForm staffId={staffId} onSuccess={close} />
        )}
      </FormSheet>

      <FormSheet
        title="Upload document"
        description="PDF, image or Word doc — up to 5MB."
        trigger={
          <Button variant="outline" size="sm">
            <Upload className="size-4" /> Document
          </Button>
        }
      >
        {({ close }) => (
          <DocumentUploadForm staffId={staffId} onSuccess={close} />
        )}
      </FormSheet>

      <EditStaffSheet
        staffId={staffId}
        staff={staff}
        centers={centers}
        roles={roles}
      />
    </div>
  );
}
