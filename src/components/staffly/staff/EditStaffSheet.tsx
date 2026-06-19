"use client";

import { FormSheet } from "@/components/staffly/shared/FormSheet";
import { SheetBody } from "@/components/ui/sheet";
import { StaffForm, type StaffFormValues } from "@/components/staffly/staff/StaffForm";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { updateStaff } from "@/lib/staffly/actions/staff";

export function EditStaffSheet({
  staffId,
  staff,
  centers,
  roles,
}: {
  staffId: string;
  staff: StaffFormValues;
  centers: { id: string; name: string }[];
  roles: { id: string; name: string }[];
}) {
  return (
    <FormSheet
      title="Edit staff member"
      description="Update profile details. Certifications and training live on their own tabs."
      trigger={
        <Button variant="outline" size="sm">
          <Pencil className="size-4" /> Edit
        </Button>
      }
    >
      {() => (
        <SheetBody>
          <StaffForm
            action={updateStaff.bind(null, staffId)}
            staff={staff}
            centers={centers}
            roles={roles}
            submitLabel="Save changes"
            cancelHref={`/staff/${staffId}/overview`}
          />
        </SheetBody>
      )}
    </FormSheet>
  );
}
