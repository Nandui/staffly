import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { BRADFORD_LEVEL_META } from "@/lib/staffly/constants";
import type { BradfordResult } from "@/lib/staffly/bradford";

const SEGMENTS: { level: keyof typeof BRADFORD_LEVEL_META; flex: number }[] = [
  { level: "low", flex: 45 },
  { level: "medium", flex: 55 },
  { level: "high", flex: 100 },
  { level: "critical", flex: 60 },
];
const SCALE_MAX = 260;

export function BradfordScoreCard({ result }: { result: BradfordResult }) {
  const meta = BRADFORD_LEVEL_META[result.riskLevel];
  const markerPct = Math.min((result.score / SCALE_MAX) * 100, 100);

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow mb-1">Bradford Factor</p>
          <div className="flex items-end gap-3">
            <span className={cn("font-mono text-5xl font-semibold leading-none tnum", meta.text)}>
              {result.score}
            </span>
            <span
              className={cn(
                "mb-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                meta.pill,
              )}
            >
              {meta.label} risk
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-mono text-ink-soft">{result.spells}</span> spell
            {result.spells === 1 ? "" : "s"} ·{" "}
            <span className="font-mono text-ink-soft">{result.totalDays}</span> day
            {result.totalDays === 1 ? "" : "s"} (rolling 52 weeks)
          </p>
        </div>
        <div className="rounded-lg bg-surface-2 px-3 py-2 text-right">
          <p className="font-mono text-xs text-muted-foreground">B = S² × D</p>
          <p className="font-mono text-xs text-faint">
            {result.spells}² × {result.totalDays} = {result.score}
          </p>
        </div>
      </div>

      {/* Visual scale */}
      <div className="mt-5">
        <div className="relative h-2.5 w-full overflow-hidden rounded-full">
          <div className="flex h-full w-full">
            {SEGMENTS.map((s) => (
              <span
                key={s.level}
                className={cn("h-full", BRADFORD_LEVEL_META[s.level].bar)}
                style={{ flex: s.flex }}
              />
            ))}
          </div>
          <span
            className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-ink shadow"
            style={{ left: `${markerPct}%` }}
            aria-hidden
          />
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-[0.65rem] text-faint">
          <span>0</span>
          <span>45</span>
          <span>100</span>
          <span>200+</span>
        </div>
      </div>
    </Card>
  );
}
