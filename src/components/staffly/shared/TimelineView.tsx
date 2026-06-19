"use client";

import * as React from "react";
import {
  UserPlus,
  CalendarOff,
  ShieldCheck,
  GraduationCap,
  MessageSquare,
  TriangleAlert,
  FileText,
  History,
  type LucideIcon,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import type { TimelineEvent, TimelineType } from "@/lib/staffly/data/timeline";

const TYPE_META: Record<
  TimelineType,
  { label: string; Icon: LucideIcon; tint: string }
> = {
  joined: { label: "Joined", Icon: UserPlus, tint: "text-primary bg-accent" },
  absence: {
    label: "Absence",
    Icon: CalendarOff,
    tint: "text-cert-expiring bg-cert-expiring-bg",
  },
  cert: {
    label: "Certifications",
    Icon: ShieldCheck,
    tint: "text-cert-valid bg-cert-valid-bg",
  },
  training: {
    label: "Training",
    Icon: GraduationCap,
    tint: "text-blue-700 bg-blue-50",
  },
  performance: {
    label: "Performance",
    Icon: MessageSquare,
    tint: "text-violet-700 bg-violet-50",
  },
  disciplinary: {
    label: "Disciplinary",
    Icon: TriangleAlert,
    tint: "text-cert-expired bg-cert-expired-bg",
  },
  document: { label: "Documents", Icon: FileText, tint: "text-slate-600 bg-slate-100" },
};

export function TimelineView({ events }: { events: TimelineEvent[] }) {
  const present = React.useMemo(() => {
    const set = new Set<TimelineType>();
    events.forEach((e) => set.add(e.type));
    return [...set];
  }, [events]);

  const [active, setActive] = React.useState<Set<TimelineType>>(
    () => new Set(present),
  );

  const toggle = (t: TimelineType) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next.size ? next : new Set(present);
    });
  };

  const filtered = events.filter((e) => active.has(e.type));

  if (events.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="Nothing on the timeline yet"
        description="Absences, certifications, training and notes will appear here as they're logged."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {present.map((t) => {
          const meta = TYPE_META[t];
          const on = active.has(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => toggle(t)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                on
                  ? "border-primary/30 bg-accent text-accent-foreground"
                  : "border-line bg-surface text-muted-foreground hover:bg-surface-2",
              )}
            >
              <meta.Icon className="size-3.5" />
              {meta.label}
            </button>
          );
        })}
      </div>

      <ol className="relative">
        {filtered.map((e, i) => {
          const meta = TYPE_META[e.type];
          const last = i === filtered.length - 1;
          return (
            <li key={e.id} className="relative flex gap-3.5 pb-5 last:pb-0">
              {!last && (
                <span
                  aria-hidden
                  className="absolute left-[18px] top-9 bottom-0 w-px -translate-x-1/2 bg-line"
                />
              )}
              <span
                className={cn(
                  "relative z-10 mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
                  meta.tint,
                )}
              >
                <meta.Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1 pt-1">
                <p className="text-sm font-medium text-ink">{e.title}</p>
                {e.detail && (
                  <p className="text-sm text-muted-foreground">{e.detail}</p>
                )}
                <p className="mt-0.5 font-mono text-xs text-faint">
                  {formatDate(e.date)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
