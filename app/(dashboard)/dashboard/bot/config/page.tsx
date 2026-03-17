"use client";

import { FaDiscord } from "react-icons/fa";
import { Cpu, Save } from "lucide-react";
import { BorderBeam } from "@/components/magicui/border-beam";
import { CyberInput, PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";
import { useBotConfig } from "@/hooks/use-bot-config";

export default function BotConfigPage() {
  const { config, saving, saved, update, save } = useBotConfig();

  if (!config) return <LoadingScreen />;

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<FaDiscord className="size-4" />}
        title="Identité & Token"
        subtitle="Nom, préfixe et token Discord"
        status={config.status}
      />

      <div className="relative overflow-hidden rounded-xl border bg-card">
        <BorderBeam
          size={250}
          duration={15}
          colorFrom="#3b82f6"
          colorTo="#8b5cf6"
          className="pointer-events-none"
        />

        <div className="flex items-center gap-2 border-b px-4 py-3">
          <div className="flex gap-1.5">
            <div className="size-2.5 rounded-full border border-red-500/40 bg-red-500/10" />
            <div className="size-2.5 rounded-full border border-yellow-500/40 bg-yellow-500/10" />
            <div className="size-2.5 rounded-full border border-green-500/40 bg-green-500/10" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            &gt; identity.config — {config.name}
          </span>
          <Cpu className="ml-auto size-3.5 text-muted-foreground/40" />
        </div>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <CyberInput
              label="bot_name"
              value={config.name}
              onChange={(v) => update("name", v)}
              placeholder="Mon Super Bot"
            />
            <CyberInput
              label="prefix"
              value={config.prefix}
              onChange={(v) => update("prefix", v)}
              placeholder="!"
            />
          </div>
          <CyberInput
            label="discord_token"
            value={config.token ?? ""}
            onChange={(v) => update("token", v)}
            type="password"
            placeholder="Colle le token de ton bot Discord ici"
          />

          <div className="rounded-lg border border-dashed p-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              comment_obtenir_un_token
            </p>
            <ol className="mt-2 space-y-1">
              {[
                "Va sur discord.com/developers/applications",
                "Crée une nouvelle application",
                'Va dans l\'onglet "Bot"',
                "Clique sur \"Reset Token\" et copie-le ici",
              ].map((step, i) => (
                <li key={i} className="font-mono text-[10px] text-muted-foreground/60">
                  <span className="text-blue-500/60">{i + 1}.</span> {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg border border-dashed px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
        >
          <Save className="size-3.5" />
          {saved ? "✓ saved" : saving ? "saving..." : "save_config"}
        </button>
      </div>
    </div>
  );
}
