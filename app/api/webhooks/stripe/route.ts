import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Next.js doit recevoir le body brut pour vérifier la signature Stripe
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  // Paiement confirmé
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { botId, plan } = session.metadata ?? {};

    if (!botId || !plan) {
      return NextResponse.json({ error: "Metadata manquante" }, { status: 400 });
    }

    await prisma.discordBot.update({
      where: { id: botId },
      data: {
        plan,
        stripeSessionId: session.id,
        paidAt: new Date(),
        planEndsAt: null,
        // Sauvegarder l'ID de l'abonnement pour pouvoir l'annuler plus tard
        ...(plan === "PRO" && session.subscription && {
          stripeSubscriptionId: session.subscription as string,
          status: "STARTING",
          workerCommand: "START",
        }),
      },
    });

    console.log(`✅ Paiement confirmé — Bot ${botId} — Plan ${plan}`);
  }

  // Abonnement supprimé (fin de période après annulation)
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;

    const bot = await prisma.discordBot.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (bot) {
      await prisma.discordBot.update({
        where: { id: bot.id },
        data: {
          plan: null,
          stripeSubscriptionId: null,
          planEndsAt: null,
          workerCommand: "STOP",
        },
      });
      console.log(`🛑 Abonnement expiré — Bot ${bot.id} arrêté`);
    }
  }

  return NextResponse.json({ received: true });
}
