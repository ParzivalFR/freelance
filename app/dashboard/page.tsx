import { SectionCards } from "@/components/dashboard/section-cards";

export default async function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <SectionCards />
      <div className="min-h-screen flex-1 rounded-xl bg-muted/50" />
    </div>
  );
}
