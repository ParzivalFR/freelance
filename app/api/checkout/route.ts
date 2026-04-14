import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICES = {
  ZIP: process.env.STRIPE_PRICE_ZIP!,
  PRO: process.env.STRIPE_PRICE_PRO!,
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
    mode: plan === "PRO" ? "subscription" : "payment",
    line_items: [{ price: PRICES[plan as keyof typeof PRICES], quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${process.env.NEXTAUTH_URL}/dashboard/bot/${botId}?success=1&plan=${plan}`,
    cancel_url:  `${process.env.NEXTAUTH_URL}/dashboard/bot/${botId}?cancelled=1`,
    metadata: {
      botId,
      userId: session.user.id,
      plan,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
