import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/monitor-crypto";
import { NextResponse } from "next/server";

// Délai max sans heartbeat avant de considérer le bot OFFLINE (90s)
const HEARTBEAT_TIMEOUT_MS = 90_000;

function computeStatus(bot: { status: string; lastHeartbeatAt?: Date | null }): string {
  if (bot.status !== "ONLINE") return bot.status;
  if (!bot.lastHeartbeatAt) return "OFFLINE";
  const elapsed = Date.now() - bot.lastHeartbeatAt.getTime();
  return elapsed > HEARTBEAT_TIMEOUT_MS ? "OFFLINE" : "ONLINE";
}

// GET — récupère le bot par botId (query param), vérifie ownership
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const botId = searchParams.get("botId");

  if (!botId) {
    return NextResponse.json({ error: "botId manquant" }, { status: 400 });
  }

  try {
    const bot = await prisma.discordBot.findFirst({
      where: { id: botId, userId: session.user.id },
    });

    if (!bot) {
      return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });
    }

    // Statut calculé à partir du heartbeat
    const realStatus = computeStatus(bot);

    const { token: _token, ...botWithoutToken } = bot;
    return NextResponse.json({ ...botWithoutToken, status: realStatus, hasToken: !!_token });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH — met à jour la config du bot
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, token, prefix, moduleWelcome, moduleModeration, moduleTickets, moduleLevel, moduleLog, moduleSurvey, moduleMonitor, moduleGiveaway, moduleVerification, moduleTempchannels, moduleStarboard, moduleReactionRoles, moduleAutoresponse, moduleEconomy, moduleApplications, moduleBirthday, moduleSuggestions, moduleAfk, moduleScheduler, moduleAibuild, moduleStatus, moduleHoneypot, config, status, workerCommand } = body;

    const VALID_COMMANDS = ["START", "STOP", "RESTART", null];
    if (workerCommand !== undefined && !VALID_COMMANDS.includes(workerCommand)) {
      return NextResponse.json({ error: "Commande invalide" }, { status: 400 });
    }

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    // Vérifie que le bot appartient bien à l'utilisateur connecté
    const existing = await prisma.discordBot.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });
    }

    // Détecter si un flag de module a changé → déclencher un RESTART automatique
    const MODULE_FLAGS = [
      ["moduleWelcome", moduleWelcome], ["moduleModeration", moduleModeration],
      ["moduleTickets", moduleTickets], ["moduleLevel", moduleLevel],
      ["moduleLog", moduleLog], ["moduleSurvey", moduleSurvey],
      ["moduleMonitor", moduleMonitor], ["moduleGiveaway", moduleGiveaway],
      ["moduleVerification", moduleVerification], ["moduleTempchannels", moduleTempchannels],
      ["moduleStarboard", moduleStarboard], ["moduleReactionRoles", moduleReactionRoles],
      ["moduleAutoresponse", moduleAutoresponse], ["moduleEconomy", moduleEconomy],
      ["moduleApplications", moduleApplications], ["moduleBirthday", moduleBirthday],
      ["moduleSuggestions", moduleSuggestions], ["moduleAfk", moduleAfk],
      ["moduleScheduler", moduleScheduler], ["moduleAibuild", moduleAibuild],
      ["moduleStatus", moduleStatus], ["moduleHoneypot", moduleHoneypot],
    ] as const;
    const moduleChanged = MODULE_FLAGS.some(
      ([key, val]) => val !== undefined && val !== (existing as Record<string, unknown>)[key]
    );
    const shouldRestart = moduleChanged && existing.status === "ONLINE" && workerCommand == null;

    // Guard plan : les modules PRO ne peuvent pas être activés sans abonnement
    const isPro = existing.plan === "PRO" || existing.plan === "MANAGED";
    // Seuls les modules réellement PRO — welcome/moderation/logs/levels/reactionroles sont GRATUITS
    const PRO_MODULES: Record<string, boolean | undefined> = {
      moduleTickets, moduleSurvey, moduleMonitor,
      moduleGiveaway, moduleVerification, moduleTempchannels, moduleStarboard,
      moduleAutoresponse, moduleEconomy, moduleApplications,
      moduleBirthday, moduleSuggestions, moduleAfk, moduleScheduler, moduleAibuild,
    };
    if (!isPro) {
      for (const [key, value] of Object.entries(PRO_MODULES)) {
        if (value === true) {
          return NextResponse.json(
            { error: `Le module "${key}" nécessite un abonnement PRO.` },
            { status: 403 }
          );
        }
      }
    }

    const updated = await prisma.discordBot.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        // On chiffre le token avant stockage. Un token vide = « ne pas changer ».
        ...(token !== undefined && token !== "" && { token: encrypt(token) }),
        ...(prefix !== undefined && { prefix }),
        ...(moduleWelcome !== undefined && { moduleWelcome }),
        ...(moduleModeration !== undefined && { moduleModeration }),
        ...(moduleTickets !== undefined && { moduleTickets }),
        ...(moduleLevel !== undefined && { moduleLevel }),
        ...(moduleLog !== undefined && { moduleLog }),
        ...(moduleSurvey !== undefined && { moduleSurvey }),
        ...(moduleMonitor !== undefined && { moduleMonitor }),
        ...(moduleGiveaway !== undefined && { moduleGiveaway }),
        ...(moduleVerification !== undefined && { moduleVerification }),
        ...(moduleTempchannels !== undefined && { moduleTempchannels }),
        ...(moduleStarboard !== undefined && { moduleStarboard }),
        ...(moduleReactionRoles !== undefined && { moduleReactionRoles }),
        ...(moduleAutoresponse !== undefined && { moduleAutoresponse }),
        ...(moduleEconomy !== undefined && { moduleEconomy }),
        ...(moduleApplications !== undefined && { moduleApplications }),
        ...(moduleBirthday !== undefined && { moduleBirthday }),
        ...(moduleSuggestions !== undefined && { moduleSuggestions }),
        ...(moduleAfk !== undefined && { moduleAfk }),
        ...(moduleScheduler !== undefined && { moduleScheduler }),
        ...(moduleAibuild !== undefined && { moduleAibuild }),
        ...(moduleStatus !== undefined && { moduleStatus }),
        ...(moduleHoneypot !== undefined && { moduleHoneypot }),
        ...(config !== undefined && { config }),
        ...(status !== undefined && { status }),
        ...(workerCommand !== undefined && { workerCommand }),
        ...(shouldRestart && { workerCommand: "RESTART" }),
      },
    });

    const { token: _t, ...updatedWithoutToken } = updated;
    return NextResponse.json(updatedWithoutToken);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
