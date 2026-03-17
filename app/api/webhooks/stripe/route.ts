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
        // Plan géré → on démarre le bot automatiquement
        ...(plan === "MANAGED" && { status: "STARTING" }),
      },
    });

    console.log(`✅ Paiement confirmé — Bot ${botId} — Plan ${plan}`);
  }

  return NextResponse.json({ received: true });
}
