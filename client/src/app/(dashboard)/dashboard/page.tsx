import type { Metadata } from "next";
import { StudentOverview } from "@/components/modules/student/overview";

export const metadata: Metadata = {
  title: "My Dashboard",
  description: "Submit your project and track your mentor's review.",
};

export default function StudentDashboardPage() {
  return <StudentOverview />;
}
