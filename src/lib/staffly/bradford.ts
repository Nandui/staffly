import { subWeeks } from "date-fns";
import { BRADFORD_ABSENCE_TYPES } from "@/lib/staffly/constants";

export type BradfordRiskLevel = "low" | "medium" | "high" | "critical";

export interface BradfordResult {
  score: number;
  spells: number;
  totalDays: number;
  riskLevel: BradfordRiskLevel;
}

/**
 * Bradford Factor — B = S² × D
 *   S = number of absence spells (rolling 52 weeks)
 *   D = total days absent (rolling 52 weeks)
 * Counts only short-notice absence: SICK_UNCERTIFIED, SICK_CERTIFIED,
 * UNAUTHORISED. Annual/parental/bereavement etc. are excluded.
 *
 * Thresholds: 0–44 low · 45–99 medium · 100–199 high · 200+ critical.
 */
export function calculateBradfordFactor(
  absences: { type: string; startDate: Date; endDate: Date; daysCount: number }[],
  referenceDate: Date = new Date(),
): BradfordResult {
  const windowStart = subWeeks(referenceDate, 52);

  const qualifying = absences.filter(
    (a) =>
      BRADFORD_ABSENCE_TYPES.includes(a.type) &&
      new Date(a.startDate) >= windowStart &&
      new Date(a.startDate) <= referenceDate,
  );

  const spells = qualifying.length;
  const totalDays = qualifying.reduce((sum, a) => sum + (a.daysCount || 0), 0);
  const score = spells * spells * totalDays;

  return { score, spells, totalDays, riskLevel: bradfordRiskLevel(score) };
}

export function bradfordRiskLevel(score: number): BradfordRiskLevel {
  if (score >= 200) return "critical";
  if (score >= 100) return "high";
  if (score >= 45) return "medium";
  return "low";
}
