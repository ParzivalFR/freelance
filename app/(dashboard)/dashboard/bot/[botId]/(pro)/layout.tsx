import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ProLayout({
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
    select: { plan: true },
  });

  if (!bot || (bot.plan !== "PRO" && bot.plan !== "MANAGED")) {
    redirect(`/dashboard/bot/${botId}/modules`);
  }

  return <>{children}</>;
}
