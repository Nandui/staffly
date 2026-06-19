import Link from "next/link";
import {
  CalendarOff,
  ShieldCheck,
  GraduationCap,
  Flag,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getStaffOverview } from "@/lib/staffly/data/staff";
import { BRADFORD_LEVEL_META } from "@/lib/staffly/constants";

export const metadata = { title: "Overview" };

function SummaryCard({
  icon: Icon,
  title,
  href,
  children,
}: {
  icon: typeof CalendarOff;
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Icon className="size-4 text-muted-foreground" />
          {title}
        </h3>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          View <ArrowRight className="size-3" />
        </Link>
      </div>
      <div className="mt-4">{children}</div>
    </Card>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: string;
}) {
  return (
    <div>
      <p className={cn("font-display text-2xl font-semibold tnum", tone ?? "text-ink")}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const o = await getStaffOverview(id);
  const bradford = BRADFORD_LEVEL_META[o.bradford.riskLevel];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <SummaryCard
        icon={CalendarOff}
        title="Absence summary"
        href={`/staffly/staff/${id}/absence`}
      >
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Days YTD" value={o.absencesYtd} />
          <Stat
            label="Bradford"
            value={o.bradford.score}
            tone={bradford.text}
          />
          <Stat
            label="RTW pending"
            value={o.pendingRtw}
            tone={o.pendingRtw > 0 ? "text-cert-expiring" : undefined}
          />
        </div>
      </SummaryCard>

      <SummaryCard
        icon={ShieldCheck}
        title="Cert status"
        href={`/staffly/staff/${id}/certifications`}
      >
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Valid" value={o.certHealth.valid} tone="text-cert-valid" />
          <Stat
            label="Expiring"
            value={o.certHealth.expiring}
            tone={o.certHealth.expiring > 0 ? "text-cert-expiring" : undefined}
          />
          <Stat
            label="Expired"
            value={o.certHealth.expired}
            tone={o.certHealth.expired > 0 ? "text-cert-expired" : undefined}
          />
        </div>
      </SummaryCard>

      <SummaryCard
        icon={GraduationCap}
        title="Training"
        href={`/staffly/staff/${id}/training`}
      >
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Records" value={o.trainingTotal} />
          <Stat
            label="Passed"
            value={o.trainingComplete}
            tone="text-cert-valid"
          />
        </div>
      </SummaryCard>

      <SummaryCard
        icon={Flag}
        title="Active flags"
        href={`/staffly/staff/${id}/disciplinary`}
      >
        <div className="grid grid-cols-2 gap-3">
          <Stat
            label="Open disciplinary"
            value={o.openDisciplinary}
            tone={o.openDisciplinary > 0 ? "text-cert-expired" : undefined}
          />
          <Stat
            label="Concerns"
            value={o.concerns}
            tone={o.concerns > 0 ? "text-cert-expiring" : undefined}
          />
        </div>
      </SummaryCard>
    </div>
  );
}
