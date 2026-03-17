import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICES = {
  RAR:     process.env.STRIPE_PRICE_RAR!,
  MANAGED: process.env.STRIPE_PRICE_MANAGED!,
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { plan, botId } = await request.json();

  if (!plan || !PRICES[plan as keyof typeof PRICES]) {
    return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
  }

  // Vérifie que le bot appartient bien à l'utilisateur
  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
  });
  if (!bot) {
    return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: plan === "MANAGED" ? "subscription" : "payment",
    line_items: [{ price: PRICES[plan as keyof typeof PRICES], quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard/bot?success=1&plan=${plan}`,
    cancel_url:  `${process.env.NEXTAUTH_URL}/dashboard/bot?cancelled=1`,
    metadata: {
      botId,
      userId: session.user.id,
      plan,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
