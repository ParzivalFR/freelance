import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const userId = session.user.id;

  // Cancel all active Stripe subscriptions before deleting
  const bots = await prisma.discordBot.findMany({
    where: { userId, stripeSubscriptionId: { not: null } },
    select: { id: true, stripeSubscriptionId: true },
  });

  for (const bot of bots) {
    if (bot.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(bot.stripeSubscriptionId).catch(() => {});
    }
  }

  // Stop all running bots
  await prisma.discordBot.updateMany({
    where: { userId, status: { in: ["ONLINE", "STARTING"] } },
    data: { workerCommand: "STOP" },
  });

  // Delete user — cascade handles bots, infractions, levels, monitors, etc.
  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ ok: true });
}
