import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  return user?.role === "ADMIN" ? session : null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const adminNote = (body.adminNote as string | undefined)?.trim() || null;
  const skipStripe = body.skipStripe === true;

  const refundRequest = await prisma.refundRequest.findUnique({
    where: { id },
    include: { bot: true },
  });

  if (!refundRequest) {
    return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
  }
  if (refundRequest.status !== "PENDING") {
    return NextResponse.json({ error: "Cette demande a déjà été traitée" }, { status: 400 });
  }

  const bot = refundRequest.bot;
  let stripeRefundId: string | null = null;

  if (!skipStripe) {
    try {
      // On cherche soit un payment_intent, soit un charge pour rembourser
      let paymentIntentId: string | null = null;
      let chargeId: string | null = null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let invoiceCustomerId: string | null = null;

      if (bot.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(bot.stripeSubscriptionId, {
          expand: ["latest_invoice.payment_intent"],
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = subscription.latest_invoice as any;
        if (invoice && typeof invoice === "object") {
          const pi = invoice.payment_intent;
          paymentIntentId = typeof pi === "string" ? pi : (pi?.id ?? null);
          // Garde le customer ID pour le fallback charges
          const cust = invoice.customer;
          invoiceCustomerId = typeof cust === "string" ? cust : (cust?.id ?? null);
        }

        if (!paymentIntentId) {
          const invoices = await stripe.invoices.list({
            subscription: bot.stripeSubscriptionId,
            status: "paid",
            limit: 1,
            expand: ["data.payment_intent"],
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const inv = invoices.data[0] as any;
          if (inv) {
            const pi = inv.payment_intent;
            paymentIntentId = typeof pi === "string" ? pi : (pi?.id ?? null);
            if (!invoiceCustomerId) {
              const cust = inv.customer;
              invoiceCustomerId = typeof cust === "string" ? cust : (cust?.id ?? null);
            }
          }
        }
      }

      // Fallback: checkout session
      if (!paymentIntentId && bot.stripeSessionId) {
        const checkoutSession = await stripe.checkout.sessions.retrieve(bot.stripeSessionId, {
          expand: ["payment_intent"],
        });
        const pi = checkoutSession.payment_intent;
        if (pi && typeof pi !== "string") {
          paymentIntentId = pi.id;
        } else if (typeof pi === "string") {
          paymentIntentId = pi;
        }
        if (!invoiceCustomerId && checkoutSession.customer) {
          const cust = checkoutSession.customer;
          invoiceCustomerId = typeof cust === "string" ? cust : (cust as any)?.id ?? null;
        }
      }

      // Fallback final: lister les charges du customer (Stripe API 2025 ne met plus payment_intent sur l'invoice pour les subscriptions Checkout)
      if (!paymentIntentId && !chargeId && invoiceCustomerId) {
        const charges = await stripe.charges.list({
          customer: invoiceCustomerId,
          limit: 10,
        });
        const successfulCharge = charges.data.find(
          (c) => c.status === "succeeded" && !c.refunded
        );
        if (successfulCharge) {
          chargeId = successfulCharge.id;
        }
      }

      if (!paymentIntentId && !chargeId) {
        return NextResponse.json(
          { error: "Impossible de trouver le paiement Stripe associé à ce bot. Vérifie manuellement ou utilise skipStripe." },
          { status: 422 }
        );
      }

      const refundParams = paymentIntentId
        ? { payment_intent: paymentIntentId }
        : { charge: chargeId! };

      const refund = await stripe.refunds.create(refundParams);
      stripeRefundId = refund.id;

      if (bot.stripeSubscriptionId) {
        await stripe.subscriptions.cancel(bot.stripeSubscriptionId).catch(() => {});
      }
    } catch (e) {
      const stripeError = e instanceof Error ? e.message : String(e);
      console.error("[refund] Stripe error:", stripeError);
      return NextResponse.json(
        { error: `Stripe : ${stripeError}` },
        { status: 502 }
      );
    }
  }

  // Stop the bot on VPS + clear plan — keep the bot in DB so the client can reconfigure later
  await prisma.discordBot.update({
    where: { id: bot.id },
    data: {
      plan: null,
      paidAt: null,
      planEndsAt: null,
      stripeSubscriptionId: null,
      stripeSessionId: null,
      status: "OFFLINE",
      workerCommand: (bot.plan === "PRO" || bot.plan === "MANAGED") ? "STOP" : null,
    },
  });

  await prisma.refundRequest.update({
    where: { id },
    data: {
      status: "APPROVED",
      stripeRefundId,
      adminNote,
      processedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, stripeRefundId, stripeSkipped: skipStripe });
}
