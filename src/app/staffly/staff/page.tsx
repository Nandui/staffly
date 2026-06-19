import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/staffly/layout/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClasses } from "@/components/ui/button";
import { StaffTable } from "@/components/staffly/staff/StaffTable";
import { getCenterContext } from "@/lib/center-context";
import { getCurrentUser, can } from "@/lib/auth";
import { listStaffWithMetrics } from "@/lib/staffly/data/staff";

export const metadata = { title: "Staff directory" };

export default async function StaffDirectoryPage() {
  const { selected, selectedId } = await getCenterContext();
  const [user, rows] = await Promise.all([
    getCurrentUser(),
    listStaffWithMetrics(selectedId),
  ]);
  const canCreate = can(user, "editContent");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={selected ? selected.name : "All centres"}
        title="Staff directory"
        description="Everyone across your centres, with absence, Bradford and certification health at a glance."
        actions={
          canCreate ? (
            <Link href="/staffly/staff/new" className={buttonClasses()}>
              <Plus className="size-4" /> Add staff
            </Link>
          ) : undefined
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No staff yet"
          description="Add your team to start tracking absence, certifications and training."
          action={
            canCreate ? (
              <Link href="/staffly/staff/new" className={buttonClasses()}>
                <Plus className="size-4" /> Add staff
              </Link>
            ) : undefined
          }
        />
      ) : (
        <StaffTable rows={rows} />
      )}
    </div>
  );
}
