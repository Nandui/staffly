import { TimelineView } from "@/components/staffly/shared/TimelineView";
import { getStaffTimeline } from "@/lib/staffly/data/timeline";

export const metadata = { title: "Timeline" };

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const events = await getStaffTimeline(id);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <h2 className="text-base font-semibold text-ink">Timeline</h2>
        {events.length > 0 && (
          <span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-xs font-semibold tnum text-muted-foreground">
            {events.length}
          </span>
        )}
      </div>
      <TimelineView events={events} />
    </div>
  );
}
