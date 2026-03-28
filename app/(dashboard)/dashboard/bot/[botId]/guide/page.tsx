"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Key,
  Link2,
  Settings,
  Shield,
  UserPlus,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { FaDiscord } from "react-icons/fa";

const STEPS = [
  {
    id: 1,
    icon: ExternalLink,
    title: "Accéder au Discord Developer Portal",
    badge: "Prérequis",
    badgeVariant: "secondary" as const,
    description:
      "Connecte-toi au portail développeur Discord avec ton compte Discord.",
    content: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Rends-toi sur le Developer Portal Discord en cliquant sur le lien
          ci-dessous :
        </p>
        <a
          href="https://discord.com/developers/applications"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 font-mono text-sm text-blue-400 transition-colors hover:bg-blue-500/20"
        >
          <FaDiscord className="size-4" />
          discord.com/developers/applications
          <ExternalLink className="size-3" />
        </a>
        <div className="flex items-start gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-yellow-400" />
          <p className="text-xs text-yellow-300">
            Connecte-toi avec le compte Discord qui sera propriétaire du bot.
            Idéalement, utilise un compte admin de ton serveur.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    icon: Zap,
    title: "Créer une nouvelle application",
    badge: "Étape 1",
    badgeVariant: "outline" as const,
    description: "Crée l'application qui hébergera ton bot Discord.",
    content: (
      <div className="space-y-3">
        <ol className="space-y-3">
          {[
            'Clique sur le bouton bleu "New Application" en haut à droite',
            "Donne un nom à ton application (ex: Mon Bot, NomDuServeur Bot...)",
            'Accepte les conditions d\'utilisation et clique sur "Create"',
            "Tu arrives sur la page de ton application",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 font-mono text-xs font-bold text-blue-400">
                {i + 1}
              </span>
              <span className="text-sm text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
        <div className="flex items-start gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-blue-400" />
          <p className="text-xs text-blue-300">
            Le nom de l&apos;application n&apos;est pas forcément le nom affiché
            par le bot. Tu pourras le personnaliser dans la section{" "}
            <strong>Bot</strong>.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    icon: FaDiscord,
    title: "Configurer le Bot",
    badge: "Étape 2",
    badgeVariant: "outline" as const,
    description: "Crée le bot associé à ton application et personnalise-le.",
    content: (
      <div className="space-y-3">
        <ol className="space-y-3">
          {[
            'Dans le menu gauche, clique sur "Bot"',
            'Tu vois le nom de ton bot — clique sur "Add Bot" si demandé',
            "Personnalise le nom d'utilisateur et l'avatar si tu le souhaites",
            'Désactive "Public Bot" si tu ne veux pas que d\'autres puissent l\'inviter',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 font-mono text-xs font-bold text-blue-400">
                {i + 1}
              </span>
              <span className="text-sm text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    ),
  },
  {
    id: 4,
    icon: Shield,
    title: "Activer les 3 Intents Privilégiés",
    badge: "Critique",
    badgeVariant: "destructive" as const,
    description:
      "Sans ces intents, le bot ne pourra pas voir les membres ni les messages.",
    content: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Toujours dans la section <strong className="text-foreground">Bot</strong>, fais défiler vers le bas jusqu&apos;à{" "}
          <strong className="text-foreground">Privileged Gateway Intents</strong> et active les 3 :
        </p>
        <div className="space-y-2">
          {[
            {
              name: "PRESENCE INTENT",
              desc: "Permet de voir le statut et l'activité des membres",
              color: "green",
            },
            {
              name: "SERVER MEMBERS INTENT",
              desc: "Indispensable pour les événements d'arrivée/départ membres",
              color: "blue",
            },
            {
              name: "MESSAGE CONTENT INTENT",
              desc: "Indispensable pour la modération et les commandes",
              color: "purple",
            },
          ].map((intent) => (
            <div
              key={intent.name}
              className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-3"
            >
              <div className={`size-2 rounded-full bg-${intent.color}-400 shrink-0`} />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs font-bold text-foreground">
                  {intent.name}
                </p>
                <p className="text-xs text-muted-foreground">{intent.desc}</p>
              </div>
              <Badge variant="outline" className="shrink-0 border-green-500/30 text-green-400 font-mono text-[10px]">
                ON
              </Badge>
            </div>
          ))}
        </div>
        <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-400" />
          <p className="text-xs text-red-300">
            N&apos;oublie pas de cliquer sur <strong>Save Changes</strong> après avoir activé les intents !
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    icon: Key,
    title: "Récupérer le Token du Bot",
    badge: "Étape 3",
    badgeVariant: "outline" as const,
    description: "Le token est la clé secrète qui permet au bot de se connecter.",
    content: (
      <div className="space-y-4">
        <ol className="space-y-3">
          {[
            'Dans la section "Bot", clique sur "Reset Token"',
            "Confirme l'action (Discord te demandera peut-être ton mot de passe 2FA)",
            "Copie le token affiché immédiatement — il ne sera plus visible ensuite",
            'Colle-le dans la page "Identité & Token" de ton dashboard',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 font-mono text-xs font-bold text-blue-400">
                {i + 1}
              </span>
              <span className="text-sm text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
        <div className="rounded-lg border border-white/10 bg-black/30 p-3">
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Exemple de token
          </p>
          <p className="font-mono text-xs text-muted-foreground/60 break-all">
            TON_TOKEN_ICI.xxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
          </p>
        </div>
        <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-400" />
          <p className="text-xs text-red-300">
            <strong>Ne partage jamais ton token !</strong> Quiconque possède ce token contrôle entièrement ton bot. En cas de fuite, va dans Discord Developer Portal et clique sur{" "}
            <strong>Reset Token</strong> immédiatement.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 6,
    icon: Settings,
    title: "Configurer les permissions OAuth2",
    badge: "Étape 4",
    badgeVariant: "outline" as const,
    description: "Définis ce que le bot est autorisé à faire sur le serveur.",
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Dans le menu gauche, clique sur <strong className="text-foreground">OAuth2</strong> puis{" "}
          <strong className="text-foreground">OAuth2 URL Generator</strong>.
        </p>
        <div className="space-y-3">
          <div>
            <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Scopes à cocher
            </p>
            <div className="flex flex-wrap gap-2">
              {["bot", "applications.commands"].map((scope) => (
                <Badge key={scope} variant="outline" className="font-mono text-xs border-blue-500/30 text-blue-400">
                  {scope}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Bot Permissions à cocher
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "Administrator",
              ].map((perm) => (
                <Badge key={perm} variant="outline" className="font-mono text-xs border-yellow-500/30 text-yellow-400">
                  {perm}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-yellow-400" />
          <p className="text-xs text-yellow-300">
            La permission <strong>Administrator</strong> est la plus simple pour démarrer. Pour un usage avancé, tu peux affiner les permissions plus tard.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 7,
    icon: Link2,
    title: "Générer le lien d'invitation",
    badge: "Étape 5",
    badgeVariant: "outline" as const,
    description: "Génère le lien pour inviter ton bot sur ton serveur Discord.",
    content: (
      <div className="space-y-3">
        <ol className="space-y-3">
          {[
            "Après avoir coché les scopes et permissions, fais défiler vers le bas",
            "Copie l'URL générée dans la section \"Generated URL\"",
            "Ouvre ce lien dans ton navigateur",
            "Sélectionne ton serveur Discord dans le menu déroulant",
            "Clique sur \"Autoriser\" — le bot rejoint ton serveur !",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 font-mono text-xs font-bold text-blue-400">
                {i + 1}
              </span>
              <span className="text-sm text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
        <div className="flex items-start gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-blue-400" />
          <p className="text-xs text-blue-300">
            Pour inviter le bot, tu dois avoir la permission <strong>Gérer le serveur</strong> sur le serveur cible.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 8,
    icon: UserPlus,
    title: "Configurer et démarrer le bot",
    badge: "Dernière étape",
    badgeVariant: "default" as const,
    description: "Configure ton bot dans le dashboard et lance-le.",
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Maintenant que le bot est invité sur ton serveur, retourne dans le dashboard :
        </p>
        <ol className="space-y-3">
          {[
            {
              text: 'Va dans "Identité & Token" et colle ton token',
            },
            {
              text: 'Active les modules que tu veux dans "Modules"',
            },
            {
              text: 'Choisis ton plan et déploie dans "Déploiement"',
            },
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-green-500/20 font-mono text-xs font-bold text-green-400">
                {i + 1}
              </span>
              <span className="text-sm text-muted-foreground">
                {step.text}
              </span>
            </li>
          ))}
        </ol>
        <div className="flex items-start gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-400" />
          <p className="text-xs text-green-300">
            Une fois démarré, le statut de ton bot passera à{" "}
            <strong className="text-green-400">ONLINE</strong> dans la vue d&apos;ensemble. Le bot enverra un heartbeat toutes les 30 secondes pour confirmer qu&apos;il tourne.
          </p>
        </div>
      </div>
    ),
  },
];

export default function GuidePage() {
  const [openStep, setOpenStep] = useState<number | null>(1);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <FaDiscord className="size-3" />
          Guide de configuration
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Configurer ton bot Discord
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Suis ces étapes dans l&apos;ordre pour créer, configurer et démarrer ton bot de A à Z.
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => (
          <div key={step.id} className="flex items-center gap-1">
            <div
              className={`h-1.5 w-8 rounded-full transition-colors ${
                openStep && step.id <= openStep
                  ? "bg-blue-500"
                  : "bg-white/10"
              }`}
            />
            {i < STEPS.length - 1 && (
              <ChevronRight className="size-3 text-white/20" />
            )}
          </div>
        ))}
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isOpen = openStep === step.id;

          return (
            <Card
              key={step.id}
              className={`cursor-pointer border transition-all ${
                isOpen
                  ? "border-blue-500/30 bg-blue-500/5"
                  : "border-white/5 bg-white/[0.02] hover:border-white/10"
              }`}
              onClick={() => setOpenStep(isOpen ? null : step.id)}
            >
              <CardHeader className="pb-0 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg border ${
                        isOpen
                          ? "border-blue-500/30 bg-blue-500/20 text-blue-400"
                          : "border-white/10 bg-white/5 text-muted-foreground"
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-semibold">
                          {step.title}
                        </CardTitle>
                        <Badge
                          variant={step.badgeVariant}
                          className="font-mono text-[10px]"
                        >
                          {step.badge}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        {step.description}
                      </CardDescription>
                    </div>
                  </div>
                  <ChevronRight
                    className={`size-4 shrink-0 text-muted-foreground transition-transform ${
                      isOpen ? "rotate-90" : ""
                    }`}
                  />
                </div>
              </CardHeader>
              {isOpen && (
                <CardContent className="pt-4">
                  <div className="ml-11">{step.content}</div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Footer CTA */}
      <Card className="border-green-500/20 bg-green-500/5">
        <CardContent className="flex items-center gap-4 pt-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-green-500/30 bg-green-500/20">
            <CheckCircle2 className="size-5 text-green-400" />
          </div>
          <div>
            <p className="text-sm font-semibold">Tu as des questions ?</p>
            <p className="text-xs text-muted-foreground">
              Contacte le support — on t&apos;aide à configurer ton bot en moins de 10 minutes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
