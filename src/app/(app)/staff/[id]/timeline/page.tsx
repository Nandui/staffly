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
    <div className="space-y-5">
      <h2 className="font-display text-lg font-semibold text-ink">Timeline</h2>
      <TimelineView events={events} />
    </div>
  );
}
