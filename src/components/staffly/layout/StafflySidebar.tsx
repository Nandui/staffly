"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarOff,
  ShieldCheck,
  Grid3X3,
  BookOpen,
  Bell,
  Settings,
  UsersRound,
  X,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CenterSwitcher } from "@/components/center-switcher";
import { signOutAction } from "@/lib/actions/auth";
import type { CenterSummary } from "@/lib/center-shared";

export interface ShellUser {
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: number;
}

export function navSections(notifCount: number): {
  heading: string;
  items: NavItem[];
}[] {
  return [
    {
      heading: "Main",
      items: [
        { href: "/staffly", label: "Dashboard", icon: LayoutDashboard, exact: true },
        { href: "/staffly/staff", label: "Staff Directory", icon: Users },
        { href: "/staffly/absence", label: "Absence Overview", icon: CalendarOff },
      ],
    },
    {
      heading: "Compliance",
      items: [
        { href: "/staffly/certifications", label: "Certifications", icon: ShieldCheck },
        { href: "/staffly/training-matrix", label: "Training Matrix", icon: Grid3X3 },
        { href: "/staffly/training-library", label: "Training Library", icon: BookOpen },
      ],
    },
    {
      heading: "System",
      items: [
        {
          href: "/staffly/notifications",
          label: "Notifications",
          icon: Bell,
          badge: notifCount,
        },
        { href: "/staffly/settings", label: "Settings", icon: Settings },
      ],
    },
  ];
}

function initials(user: ShellUser) {
  const base = user.name || user.email || "?";
  return base
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function StafflySidebar({
  centers,
  selectedId,
  user,
  notifCount,
  open,
  onClose,
}: {
  centers: CenterSummary[];
  selectedId: string | null;
  user: ShellUser;
  notifCount: number;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside
      className={cn(
        "no-print fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-sidebar-line bg-sidebar text-sidebar-ink transition-transform duration-200 ease-out",
        "md:sticky md:top-0 md:h-screen md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex items-center justify-between px-5 pb-4 pt-5">
        <Link href="/staffly" className="flex items-center gap-2.5" onClick={onClose}>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <UsersRound className="size-5" />
          </span>
          <span className="leading-none">
            <span className="block font-display text-lg font-semibold tracking-tight text-ink">
              Staffly
            </span>
            <span className="text-[0.65rem] uppercase tracking-[0.16em] text-sidebar-muted">
              People &amp; compliance
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="flex size-8 items-center justify-center rounded-md text-sidebar-muted hover:bg-sidebar-2 hover:text-ink md:hidden"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="px-3 pb-2">
        <CenterSwitcher centers={centers} selectedId={selectedId} />
      </div>

      <nav className="scroll-slim flex-1 space-y-4 overflow-y-auto px-3 py-3">
        {navSections(notifCount).map((section) => (
          <div key={section.heading}>
            <p className="px-3 pb-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-sidebar-muted">
              {section.heading}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-ink/80 hover:bg-sidebar-2 hover:text-ink",
                    )}
                  >
                    {active && (
                      <span
                        aria-hidden
                        className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-primary"
                      />
                    )}
                    <item.icon
                      className={cn(
                        "size-[1.15rem] shrink-0",
                        active
                          ? "text-sidebar-accent-foreground"
                          : "text-sidebar-muted group-hover:text-ink",
                      )}
                    />
                    {item.label}
                    {item.badge && item.badge > 0 ? (
                      <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-cert-expired px-1.5 text-[0.7rem] font-semibold text-white tnum">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-line p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              referrerPolicy="no-referrer"
              className="size-8 rounded-full"
            />
          ) : (
            <span className="flex size-8 items-center justify-center rounded-full bg-sidebar-2 text-xs font-semibold text-sidebar-ink">
              {initials(user)}
            </span>
          )}
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium text-ink">
              {user.name ?? user.email}
            </p>
            <p className="truncate text-[0.7rem] text-sidebar-muted">{user.role}</p>
          </div>
          <Link
            href="/account"
            onClick={onClose}
            aria-label="Account settings"
            title="Account settings"
            className="flex size-8 items-center justify-center rounded-md text-sidebar-muted transition-colors hover:bg-sidebar-2 hover:text-ink"
          >
            <Settings className="size-4" />
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              aria-label="Sign out"
              title="Sign out"
              className="flex size-8 items-center justify-center rounded-md text-sidebar-muted transition-colors hover:bg-sidebar-2 hover:text-ink"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
