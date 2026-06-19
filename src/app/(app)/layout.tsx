import { redirect } from "next/navigation";
import { StafflyShell } from "@/components/staffly/layout/StafflyShell";
import { getCenterContext } from "@/lib/center-context";
import { getCurrentUser } from "@/lib/auth";
import { getUnacknowledgedCount } from "@/lib/staffly/data/notifications";

export const dynamic = "force-dynamic";

export const metadata = {
  title: {
    default: "Staffly — People & compliance",
    template: "%s · Staffly",
  },
  description:
    "HR, absence, certifications and training across your leisure centres — part of the Centrely Suite.",
};

export default async function StafflyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, { centers, selectedId }] = await Promise.all([
    getCurrentUser(),
    getCenterContext(),
  ]);
  if (!user) redirect("/signin");

  const notifCount = await getUnacknowledgedCount(selectedId);

  return (
    <StafflyShell
      centers={centers}
      selectedId={selectedId}
      user={{
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      }}
      notifCount={notifCount}
    >
      {children}
    </StafflyShell>
  );
}
