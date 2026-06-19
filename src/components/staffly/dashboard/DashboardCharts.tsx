"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

const CERT_COLORS: Record<string, string> = {
  Valid: "var(--color-cert-valid)",
  Expiring: "var(--color-cert-expiring)",
  Expired: "var(--color-cert-expired)",
};

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number | string }[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-lg border border-line bg-popover px-2.5 py-1.5 text-xs shadow-md">
      <span className="font-medium text-ink">{p.name}</span>{" "}
      <span className="tnum text-muted-foreground">{p.value}</span>
    </div>
  );
}

export function CertHealthDonut({
  data,
}: {
  data: { valid: number; expiring: number; expired: number };
}) {
  const total = data.valid + data.expiring + data.expired;
  const slices = [
    { name: "Valid", value: data.valid },
    { name: "Expiring", value: data.expiring },
    { name: "Expired", value: data.expired },
  ].filter((s) => s.value > 0);

  if (total === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center text-sm text-faint">
        No certifications recorded
      </div>
    );
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="name"
            innerRadius={56}
            outerRadius={80}
            paddingAngle={2}
            stroke="var(--color-surface)"
            strokeWidth={2}
          >
            {slices.map((s) => (
              <Cell key={s.name} fill={CERT_COLORS[s.name]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-semibold tnum text-ink">
          {total}
        </span>
        <span className="text-xs text-muted-foreground">certs</span>
      </div>
    </div>
  );
}

export function AbsenceTrendChart({
  data,
}: {
  data: { month: string; days: number }[];
}) {
  if (data.every((d) => d.days === 0)) {
    return (
      <div className="flex h-[180px] items-center justify-center text-sm text-faint">
        No absence in the last 6 months
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "var(--color-ink-soft)" }}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "var(--color-faint)" }}
          width={32}
        />
        <Tooltip cursor={{ fill: "var(--color-surface-2)" }} content={<ChartTooltip />} />
        <Bar
          dataKey="days"
          name="Absence days"
          radius={[4, 4, 0, 0]}
          barSize={26}
          fill="var(--color-primary)"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
