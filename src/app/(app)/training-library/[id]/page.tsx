import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Layers,
  Clock,
  ClipboardCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/staffly/layout/PageHeader";
import { ModuleManager } from "@/components/staffly/training/ModuleManager";
import { getCurrentUser, can } from "@/lib/auth";
import { getProgrammeDetail } from "@/lib/staffly/data/training";
import { TRAINING_CATEGORY_LABEL } from "@/lib/staffly/constants";
import { formatMinutes } from "@/lib/staffly/utils";

export const metadata = { title: "Programme" };

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon className="size-4 text-faint" />
      </div>
      <p className="mt-2 font-display text-2xl font-semibold tnum text-ink">
        {value}
      </p>
    </div>
  );
}

export default async function ProgrammeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [programme, user] = await Promise.all([
    getProgrammeDetail(id),
    getCurrentUser(),
  ]);
  if (!programme) notFound();
  const canManage = can(user, "editContent");

  const totalMinutes = programme.modules.reduce(
    (n, m) => n + (m.estimatedMinutes ?? 0),
    0,
  );
  const assessments = programme.modules.filter((m) => m.hasAssessment).length;

  const moduleViews = programme.modules.map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    estimatedMinutes: m.estimatedMinutes,
    hasAssessment: m.hasAssessment,
    passMark: m.passMark,
    resources: m.resources.map((r) => ({
      id: r.id,
      kind: r.kind as "LINK" | "FILE",
      label: r.label,
      url: r.url,
      filename: r.filename,
    })),
    completions: m._count.completions,
  }));

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/training-library"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" /> Training library
        </Link>
        <PageHeader
          eyebrow={TRAINING_CATEGORY_LABEL[programme.category] ?? "Programme"}
          title={programme.name}
          description={programme.description || undefined}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Layers} label="Modules" value={String(programme.modules.length)} />
        <Stat
          icon={Clock}
          label="Total duration"
          value={totalMinutes ? formatMinutes(totalMinutes) : "—"}
        />
        <Stat icon={ClipboardCheck} label="Assessments" value={String(assessments)} />
        <Stat
          icon={Users}
          label="Records logged"
          value={String(programme._count.trainingRecords)}
        />
      </div>

      {programme.requiredForRoles.length > 0 && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-ink-soft">Required for:</span>{" "}
          {programme.requiredForRoles.map((r) => r.name).join(", ")}
        </p>
      )}

      <ModuleManager
        programmeId={programme.id}
        modules={moduleViews}
        canManage={canManage}
      />
    </div>
  );
}
