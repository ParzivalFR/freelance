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
  if (!bot.plan) {
    return NextResponse.json({ error: "Aucun plan actif" }, { status: 400 });
  }

  // Retrieve Stripe customer ID from subscription or checkout session
  let customerId: string | null = null;

  try {
    if (bot.stripeSubscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(bot.stripeSubscriptionId);
      customerId = typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;
    } else if (bot.stripeSessionId) {
      const checkoutSession = await stripe.checkout.sessions.retrieve(bot.stripeSessionId);
      customerId = typeof checkoutSession.customer === "string"
        ? checkoutSession.customer
        : (checkoutSession.customer?.id ?? null);
    }
  } catch (e) {
    console.error("[customer-portal] Stripe error:", e);
  }

  if (!customerId) {
    return NextResponse.json(
      { error: "Impossible de retrouver le compte Stripe associé." },
      { status: 422 }
    );
  }

  const returnUrl = `${process.env.NEXTAUTH_URL}/dashboard/bot/${botId}`;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return NextResponse.json({ url: portalSession.url });
}
