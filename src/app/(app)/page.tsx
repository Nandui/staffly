import Link from "next/link";
import {
  Users,
  CalendarOff,
  ShieldAlert,
  ListChecks,
  Plus,
  ArrowRight,
  ShieldCheck,
  Grid3X3,
  Bell,
  UserCheck,
  Activity as ActivityIcon,
  LayoutDashboard,
} from "lucide-react";
import { PageHeader } from "@/components/staffly/layout/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonClasses } from "@/components/ui/button";
import {
  CertHealthDonut,
  AbsenceTrendChart,
} from "@/components/staffly/dashboard/DashboardCharts";
import { getCenterContext } from "@/lib/center-context";
import { getCurrentUser, can } from "@/lib/auth";
import { getDashboard } from "@/lib/staffly/data/dashboard";
import { getNotifications } from "@/lib/staffly/data/notifications";
import { NOTIFICATION_PRIORITY_META } from "@/lib/staffly/constants";
import { cn, formatDate } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
  tone = "default",
  href,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  sub?: string;
  tone?: "default" | "critical" | "medium";
  href: string;
}) {
  const toneCls =
    tone === "critical"
      ? "text-critical"
      : tone === "medium"
        ? "text-medium"
        : "text-ink";
  return (
    <Link
      href={href}
      className="group rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-xs transition-colors hover:border-line-strong"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon className="size-4 text-faint" />
      </div>
      <p className={cn("mt-2 font-display text-3xl font-semibold tnum", toneCls)}>
        {value}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{sub ?? " "}</p>
    </Link>
  );
}

export default async function StafflyDashboard() {
  const { selected, selectedId } = await getCenterContext();
  const user = await getCurrentUser();
  const [d, notifications] = await Promise.all([
    getDashboard(selectedId),
    getNotifications(selectedId),
  ]);
  const canCreate = can(user, "editContent");
  const alerts = notifications.slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={selected ? selected.name : "All centres"}
        title="Dashboard"
        description="Your people at a glance — absence, expiring certifications and what needs action today."
        actions={
          canCreate ? (
            <Link href="/staff/new" className={buttonClasses()}>
              <Plus className="size-4" /> Add staff
            </Link>
          ) : undefined
        }
      />

      {d.totalStaff === 0 ? (
        <EmptyState
          icon={LayoutDashboard}
          title="No staff yet"
          description="Add your first team member to start tracking absence, certifications and training."
          action={
            <Link href="/staff/new" className={buttonClasses()}>
              <Plus className="size-4" /> Add staff
            </Link>
          }
        />
      ) : (
        <>
          {/* Stats bar */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi
              icon={Users}
              label="Active staff"
              value={d.activeStaff}
              sub={`${d.totalStaff} total`}
              href="/staff"
            />
            <Kpi
              icon={CalendarOff}
              label="Absences this month"
              value={d.absencesThisMonth}
              tone={d.absencesThisMonth > 0 ? "medium" : "default"}
              sub={d.pendingRtw > 0 ? `${d.pendingRtw} RTW pending` : "RTW up to date"}
              href="/absence"
            />
            <Kpi
              icon={ShieldAlert}
              label="Certs expiring (90d)"
              value={d.certsExpiring}
              tone={
                d.certsExpired > 0
                  ? "critical"
                  : d.certsExpiring > 0
                    ? "medium"
                    : "default"
              }
              sub={d.certsExpired > 0 ? `${d.certsExpired} expired` : "None expired"}
              href="/certifications"
            />
            <Kpi
              icon={ListChecks}
              label="Actions outstanding"
              value={d.actionsOutstanding}
              tone={d.actionsOutstanding > 0 ? "medium" : "default"}
              sub={`${d.openDisciplinary} disciplinary · ${d.pendingRtw} RTW`}
              href="/notifications"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            {/* Left 60% */}
            <div className="space-y-4 lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="size-4 text-cert-expiring" /> Alerts
                  </CardTitle>
                  <Link
                    href="/notifications"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    All notifications <ArrowRight className="size-3" />
                  </Link>
                </CardHeader>
                {alerts.length === 0 ? (
                  <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No certification alerts. Everything is current. 🎉
                  </p>
                ) : (
                  <ul className="divide-y divide-line">
                    {alerts.map((n) => {
                      const meta = NOTIFICATION_PRIORITY_META[n.priority];
                      return (
                        <li
                          key={n.id}
                          className="flex items-start gap-3 px-5 py-3"
                        >
                          <span
                            className={cn(
                              "mt-0.5 inline-flex shrink-0 rounded-full px-2 py-0.5 text-[0.7rem] font-medium",
                              meta.pill,
                            )}
                          >
                            {meta.label}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-ink">{n.message}</p>
                            <Link
                              href={`/staff/${n.staffId}/certifications`}
                              className="text-xs text-muted-foreground hover:text-primary hover:underline"
                            >
                              {n.staffName} · {n.centerName}
                            </Link>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="size-4 text-muted-foreground" /> Absent
                    today
                  </CardTitle>
                  <span className="text-xs text-muted-foreground tnum">
                    {d.absentToday.length}
                  </span>
                </CardHeader>
                {d.absentToday.length === 0 ? (
                  <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                    Full attendance — nobody is absent today.
                  </p>
                ) : (
                  <ul className="divide-y divide-line">
                    {d.absentToday.map((a) => (
                      <li
                        key={a.staffId}
                        className="flex items-center justify-between gap-3 px-5 py-3"
                      >
                        <Link
                          href={`/staff/${a.staffId}/absence`}
                          className="text-sm font-medium text-ink hover:text-primary hover:underline"
                        >
                          {a.name}
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            {a.centerName}
                          </span>
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {a.type} · back {formatDate(a.until)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ActivityIcon className="size-4 text-muted-foreground" /> Recent
                    activity
                  </CardTitle>
                </CardHeader>
                {d.recent.length === 0 ? (
                  <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                    Nothing logged yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-line">
                    {d.recent.map((r) => (
                      <li
                        key={r.id}
                        className="flex items-center justify-between gap-3 px-5 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm text-ink">{r.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {r.detail}
                          </p>
                        </div>
                        <span className="shrink-0 font-mono text-xs text-faint">
                          {formatDate(r.date)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>

            {/* Right 40% */}
            <div className="space-y-4 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cert health</CardTitle>
                  <Link
                    href="/certifications"
                    className="text-xs text-primary hover:underline"
                  >
                    Details
                  </Link>
                </CardHeader>
                <div className="p-4">
                  <CertHealthDonut data={d.certHealth} />
                  <div className="mt-3 flex justify-center gap-4 text-xs">
                    <Legend color="bg-cert-valid" label="Valid" value={d.certHealth.valid} />
                    <Legend
                      color="bg-cert-expiring"
                      label="Expiring"
                      value={d.certHealth.expiring}
                    />
                    <Legend
                      color="bg-cert-expired"
                      label="Expired"
                      value={d.certHealth.expired}
                    />
                  </div>
                </div>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Absence rate</CardTitle>
                  <span className="text-xs text-muted-foreground">Last 6 months</span>
                </CardHeader>
                <div className="p-4">
                  <AbsenceTrendChart data={d.absenceTrend} />
                </div>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick actions</CardTitle>
                </CardHeader>
                <div className="grid gap-2 p-4">
                  {canCreate && (
                    <Link
                      href="/staff/new"
                      className={cn(buttonClasses({ variant: "secondary" }), "justify-start")}
                    >
                      <Plus className="size-4" /> Add staff member
                    </Link>
                  )}
                  <Link
                    href="/certifications"
                    className={cn(buttonClasses({ variant: "secondary" }), "justify-start")}
                  >
                    <ShieldCheck className="size-4" /> Review certifications
                  </Link>
                  <Link
                    href="/training-matrix"
                    className={cn(buttonClasses({ variant: "secondary" }), "justify-start")}
                  >
                    <Grid3X3 className="size-4" /> Training matrix
                  </Link>
                  <Link
                    href="/absence"
                    className={cn(buttonClasses({ variant: "secondary" }), "justify-start")}
                  >
                    <CalendarOff className="size-4" /> Absence overview
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Legend({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span className={cn("size-2 rounded-full", color)} />
      {label} <span className="tnum font-medium text-ink">{value}</span>
    </span>
  );
}
