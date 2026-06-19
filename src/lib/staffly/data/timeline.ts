import { db } from "@/lib/db";
import {
  ABSENCE_TYPE_META,
  DISCIPLINARY_STAGE_META,
  PERF_CATEGORY_META,
  TRAINING_OUTCOME_META,
  DOCUMENT_CATEGORY_LABEL,
} from "@/lib/staffly/constants";

export type TimelineType =
  | "joined"
  | "absence"
  | "cert"
  | "training"
  | "performance"
  | "disciplinary"
  | "document";

export interface TimelineEvent {
  id: string;
  type: TimelineType;
  date: Date;
  title: string;
  detail?: string;
}

export async function getStaffTimeline(
  staffId: string,
): Promise<TimelineEvent[]> {
  const [staff, absences, certs, training, perf, disc, docs] =
    await Promise.all([
      db.staffMember.findUnique({
        where: { id: staffId },
        select: { startDate: true },
      }),
      db.absenceRecord.findMany({ where: { staffId } }),
      db.certRecord.findMany({
        where: { staffId },
        include: { certType: { select: { name: true } } },
      }),
      db.trainingRecord.findMany({ where: { staffId } }),
      db.performanceNote.findMany({ where: { staffId } }),
      db.disciplinaryRecord.findMany({ where: { staffId } }),
      db.staffDocument.findMany({ where: { staffId } }),
    ]);

  const events: TimelineEvent[] = [];

  if (staff) {
    events.push({
      id: `joined-${staffId}`,
      type: "joined",
      date: staff.startDate,
      title: "Joined the team",
      detail: "Start date",
    });
  }

  for (const a of absences) {
    events.push({
      id: `absence-${a.id}`,
      type: "absence",
      date: a.startDate,
      title: ABSENCE_TYPE_META[a.type]?.label ?? "Absence",
      detail: `${a.daysCount} day${a.daysCount === 1 ? "" : "s"}${
        a.reason ? ` — ${a.reason}` : ""
      }`,
    });
  }

  for (const c of certs) {
    events.push({
      id: `cert-${c.id}`,
      type: "cert",
      date: c.issueDate,
      title: `${c.certType.name} recorded`,
      detail: c.certNumber ? `Ref ${c.certNumber}` : undefined,
    });
  }

  for (const t of training) {
    events.push({
      id: `training-${t.id}`,
      type: "training",
      date: t.completedDate,
      title: t.title,
      detail: TRAINING_OUTCOME_META[t.outcome]?.label,
    });
  }

  for (const p of perf) {
    events.push({
      id: `perf-${p.id}`,
      type: "performance",
      date: p.noteDate,
      title: `${PERF_CATEGORY_META[p.category]?.label ?? "Note"}: ${p.title}`,
    });
  }

  for (const d of disc) {
    events.push({
      id: `disc-${d.id}`,
      type: "disciplinary",
      date: d.meetingDate,
      title: DISCIPLINARY_STAGE_META[d.stage]?.label ?? "Disciplinary",
      detail: d.outcome,
    });
  }

  for (const d of docs) {
    events.push({
      id: `doc-${d.id}`,
      type: "document",
      date: d.uploadedAt,
      title: `${DOCUMENT_CATEGORY_LABEL[d.category] ?? "Document"}: ${d.name}`,
    });
  }

  return events.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}
