import { BotSidebar } from "@/components/dashboard/bot-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// Segments de routes qui nécessitent un plan PRO ou MANAGED
const PRO_SEGMENTS = new Set([
  "monitor", "moderation", "tickets", "levels", "polls", "giveaway",
  "verification", "tempchannels", "starboard", "reaction-roles",
  "autoresponse", "economy", "applications", "birthday", "suggestions",
  "afk", "scheduler", "aibuild",
]);

export default async function BotLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ botId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const { botId } = await params;

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
    select: { id: true, plan: true },
  });

  if (!bot) redirect("/dashboard/bot");

  // Guard PRO : lit le pathname depuis le header Next.js (injecté automatiquement)
  const isPro = bot.plan === "PRO" || bot.plan === "MANAGED";
  if (!isPro) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") ?? "";
    const segment = pathname.split(`/bot/${botId}/`)[1]?.split("/")[0];
    if (segment && PRO_SEGMENTS.has(segment)) {
      redirect(`/dashboard/bot/${botId}/modules`);
    }
  }

  return (
    <SidebarProvider>
      <BotSidebar variant="inset" />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex flex-1 flex-col overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
