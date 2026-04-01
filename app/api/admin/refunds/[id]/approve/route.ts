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
  let stripeError: string | null = null;

  if (!skipStripe) {
    try {
      let paymentIntentId: string | null = null;

      if (bot.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(bot.stripeSubscriptionId, {
          expand: ["latest_invoice.payment_intent"],
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = subscription.latest_invoice as any;
        if (invoice && typeof invoice === "object") {
          const pi = invoice.payment_intent;
          paymentIntentId = typeof pi === "string" ? pi : (pi?.id ?? null);
        }
      } else if (bot.stripeSessionId) {
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

      if (!paymentIntentId) {
        return NextResponse.json(
          { error: "Impossible de trouver le paiement Stripe associé à ce bot. Vérifie manuellement ou utilise skipStripe." },
          { status: 422 }
        );
      }

      const refund = await stripe.refunds.create({ payment_intent: paymentIntentId });
      stripeRefundId = refund.id;

      if (bot.stripeSubscriptionId) {
        await stripe.subscriptions.cancel(bot.stripeSubscriptionId).catch(() => {});
      }
    } catch (e) {
      stripeError = e instanceof Error ? e.message : String(e);
      console.error("[refund] Stripe error:", stripeError);
      return NextResponse.json(
        { error: `Stripe : ${stripeError}` },
        { status: 502 }
      );
    }
  }

  // Mark refund as approved first (before deleting the bot, which would cascade-delete the request)
  await prisma.refundRequest.update({
    where: { id },
    data: {
      status: "APPROVED",
      stripeRefundId,
      adminNote,
      processedAt: new Date(),
    },
  });

  if (bot.plan === "MANAGED") {
    // Signal the worker to stop the process, then delete the bot entirely (cascade)
    await prisma.discordBot.update({
      where: { id: bot.id },
      data: { workerCommand: "STOP" },
    });
    // Short delay so the worker has a chance to pick up the STOP command
    await new Promise((r) => setTimeout(r, 3000));
    await prisma.discordBot.delete({ where: { id: bot.id } });
  } else {
    // RAR: no VPS process — just clear the plan
    await prisma.discordBot.update({
      where: { id: bot.id },
      data: {
        plan: null,
        paidAt: null,
        planEndsAt: null,
        stripeSessionId: null,
      },
    });
  }

  return NextResponse.json({ ok: true, stripeRefundId, stripeSkipped: skipStripe });
}
