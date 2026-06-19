import { notFound } from "next/navigation";
import { Building2, Briefcase, CalendarDays } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StaffStatusBadge } from "@/components/staffly/staff/StaffStatusBadge";
import { ProfileTabs } from "@/components/staffly/staff/ProfileTabs";
import { ProfileQuickActions } from "@/components/staffly/staff/ProfileQuickActions";
import { getCurrentUser, can } from "@/lib/auth";
import { getCenterContext } from "@/lib/center-context";
import { getStaffProfile } from "@/lib/staffly/data/staff";
import { listActiveRoles } from "@/lib/staffly/data/roles";
import { listActiveCertTypes } from "@/lib/staffly/data/cert-types";
import { listActiveProgrammesForLogging } from "@/lib/staffly/data/training";
import { staffInitials, staffName } from "@/lib/staffly/utils";
import { formatDate, toDateInputValue } from "@/lib/utils";

export default async function StaffProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const staff = await getStaffProfile(id);
  if (!staff) notFound();

  const [user, { centers }, roles, certTypes, programmes] = await Promise.all([
    getCurrentUser(),
    getCenterContext(),
    listActiveRoles(),
    listActiveCertTypes(),
    listActiveProgrammesForLogging(id),
  ]);
  const canManage = can(user, "editContent");

  return (
    <div className="space-y-5">
      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="size-14">
              {staff.photo && <AvatarImage src={staff.photo} alt="" />}
              <AvatarFallback className="text-lg">
                {staffInitials(staff)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
                {staffName(staff)}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <StaffStatusBadge status={staff.status} />
                {staff.role && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-ink-soft">
                    <Briefcase className="size-3" /> {staff.role.name}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-ink-soft">
                  <Building2 className="size-3" /> {staff.center.name}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="size-3" /> Started{" "}
                  <span className="font-mono">{formatDate(staff.startDate)}</span>
                </span>
              </div>
            </div>
          </div>

          {canManage && (
            <ProfileQuickActions
              staffId={staff.id}
              staff={{
                firstName: staff.firstName,
                lastName: staff.lastName,
                email: staff.email,
                phone: staff.phone,
                centerId: staff.centerId,
                roleId: staff.roleId,
                status: staff.status,
                startDate: toDateInputValue(staff.startDate),
                endDate: staff.endDate ? toDateInputValue(staff.endDate) : null,
                notes: staff.notes,
              }}
              centers={centers}
              roles={roles.map((r) => ({ id: r.id, name: r.name }))}
              certTypes={certTypes}
              programmes={programmes}
            />
          )}
        </div>
      </div>

      <ProfileTabs staffId={staff.id} />

      <div>{children}</div>
    </div>
  );
}
