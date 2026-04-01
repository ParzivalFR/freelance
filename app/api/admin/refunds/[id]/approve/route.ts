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

  // Attempt Stripe refund
  try {
    let paymentIntentId: string | null = null;

    if (bot.stripeSubscriptionId) {
      // MANAGED plan: refund latest invoice
      const subscription = await stripe.subscriptions.retrieve(bot.stripeSubscriptionId, {
        expand: ["latest_invoice.payment_intent"],
      });
      const invoice = subscription.latest_invoice as Stripe.Invoice | null;
      if (invoice && typeof invoice !== "string") {
        const pi = invoice.payment_intent;
        if (pi && typeof pi !== "string") {
          paymentIntentId = pi.id;
        } else if (typeof pi === "string") {
          paymentIntentId = pi;
        }
      }
    } else if (bot.stripeSessionId) {
      // RAR plan: refund checkout session payment
      const checkoutSession = await stripe.checkout.sessions.retrieve(bot.stripeSessionId, {
        expand: ["payment_intent"],
      });
      const pi = checkoutSession.payment_intent;
      if (pi && typeof pi !== "string") {
        paymentIntentId = pi.id;
      } else if (typeof pi === "string") {
        paymentIntentId = pi;
      }
    }

    if (paymentIntentId) {
      const refund = await stripe.refunds.create({ payment_intent: paymentIntentId });
      stripeRefundId = refund.id;
    }

    // Cancel subscription if applicable
    if (bot.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(bot.stripeSubscriptionId);
    }
  } catch (e) {
    console.error("[refund] Stripe error:", e);
    // Don't block — mark as approved even if Stripe fails (manual handling)
  }

  // Deactivate bot
  await prisma.discordBot.update({
    where: { id: bot.id },
    data: {
      plan: null,
      paidAt: null,
      planEndsAt: null,
      stripeSubscriptionId: null,
      workerCommand: bot.plan === "MANAGED" ? "STOP" : null,
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

  return NextResponse.json({ ok: true, stripeRefundId });
}
