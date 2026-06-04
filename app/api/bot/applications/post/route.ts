import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Demande au bot de poster un formulaire dans un salon Discord
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const { formId, channelId } = body;
  if (!formId || !channelId) {
    return NextResponse.json({ error: "formId et channelId requis" }, { status: 400 });
  }

  const form = await prisma.applicationForm.findUnique({ where: { id: formId } });
  if (!form) return NextResponse.json({ error: "Formulaire introuvable" }, { status: 404 });

  const bot = await prisma.discordBot.findFirst({
    where: { id: form.botId, userId: session.user.id },
  });
  if (!bot) return NextResponse.json({ error: "Non autorisé" }, { status: 404 });

  // On stocke le channelId cible et on demande au bot de poster
  await prisma.applicationForm.update({
    where: { id: formId },
    data: { channelId },
  });

  await prisma.discordBot.update({
    where: { id: form.botId },
    data: { workerCommand: `APP_POST_${formId}` },
  });

  return NextResponse.json({ success: true, message: "Le bot va poster le formulaire d'ici quelques secondes." });
}
