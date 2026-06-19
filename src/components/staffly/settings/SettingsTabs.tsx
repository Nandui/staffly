"use client";

import {
  Building2,
  Users,
  ShieldCheck,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SettingsTabKey =
  | "centres"
  | "roles"
  | "certTypes"
  | "onboardingSteps";

export interface SettingsCounts {
  centres: number;
  roles: number;
  certTypes: number;
  onboardingSteps: number;
}

const TABS: { key: SettingsTabKey; label: string; icon: LucideIcon }[] = [
  { key: "centres", label: "Centres", icon: Building2 },
  { key: "roles", label: "Roles", icon: Users },
  { key: "certTypes", label: "Certifications", icon: ShieldCheck },
  { key: "onboardingSteps", label: "Onboarding", icon: ClipboardList },
];

export function SettingsTabs({
  active,
  onSelect,
  counts,
}: {
  active: SettingsTabKey;
  onSelect: (key: SettingsTabKey) => void;
  counts: SettingsCounts;
}) {
  return (
    <div className="scrollbar-none overflow-x-auto">
      <nav className="flex min-w-max gap-1.5">
        {TABS.map((t) => {
          const isActive = active === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onSelect(t.key)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-line bg-surface text-ink shadow-xs"
                  : "border-transparent text-muted-foreground hover:bg-surface-2 hover:text-ink",
              )}
            >
              <Icon
                className={cn(
                  "size-4",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              />
              {t.label}
              <span
                className={cn(
                  "inline-flex min-w-[1.25rem] items-center justify-center rounded-md px-1.5 py-0.5 text-[0.7rem] font-semibold tnum",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "bg-surface-2 text-muted-foreground",
                )}
              >
                {counts[t.key]}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
