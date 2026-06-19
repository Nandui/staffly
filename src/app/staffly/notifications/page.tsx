import { BellOff } from "lucide-react";
import { PageHeader } from "@/components/staffly/layout/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { NotificationsTable } from "@/components/staffly/notifications/NotificationsTable";
import { getCenterContext } from "@/lib/center-context";
import { getCurrentUser, can } from "@/lib/auth";
import { getNotifications } from "@/lib/staffly/data/notifications";
import {
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_PRIORITY_META,
} from "@/lib/staffly/constants";
import { cn } from "@/lib/utils";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const { selected, selectedId } = await getCenterContext();
  const [notifications, user] = await Promise.all([
    getNotifications(selectedId),
    getCurrentUser(),
  ]);
  const canManage = can(user, "editContent");

  const counts = NOTIFICATION_PRIORITIES.map((p) => ({
    ...p,
    count: notifications.filter((n) => n.priority === p.value).length,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={selected ? selected.name : "All centres"}
        title="Notifications"
        description="Certification expiry alerts, priority-sorted. Acknowledge to clear them from the bell."
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="You're all caught up"
          description="No certifications are expiring soon. Alerts appear here automatically as expiry dates approach."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {counts.map((c) => (
              <Card key={c.value} className="p-4">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium",
                    NOTIFICATION_PRIORITY_META[c.value].pill,
                  )}
                >
                  {c.label}
                </span>
                <p className="mt-2 font-display text-3xl font-semibold tnum text-ink">
                  {c.count}
                </p>
              </Card>
            ))}
          </div>
          <NotificationsTable
            notifications={notifications}
            canManage={canManage}
            selectedId={selectedId}
          />
        </>
      )}
    </div>
  );
}
