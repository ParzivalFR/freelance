import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ botId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { botId } = await params;

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
  });

  if (!bot) {
    return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });
  }

  if (bot.plan !== "MANAGED") {
    return NextResponse.json({ error: "Ce bot n'a pas de plan MANAGED" }, { status: 400 });
  }

  if (!bot.stripeSubscriptionId) {
    return NextResponse.json({ error: "Aucun abonnement Stripe associé" }, { status: 400 });
  }

  if (bot.planEndsAt) {
    return NextResponse.json({ error: "L'abonnement est déjà en cours d'annulation" }, { status: 400 });
  }

  // Annulation à la fin de la période en cours
  const subscription = await stripe.subscriptions.update(bot.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  const planEndsAt = new Date(subscription.current_period_end * 1000);

  await prisma.discordBot.update({
    where: { id: botId },
    data: { planEndsAt },
  });

  return NextResponse.json({ planEndsAt });
}
