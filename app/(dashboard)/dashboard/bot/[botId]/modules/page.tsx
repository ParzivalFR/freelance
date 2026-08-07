"use client";

import { Check, Loader2, Puzzle } from "lucide-react";
import { ModuleToggle, PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";
import { useBotConfig } from "@/hooks/use-bot-config";
import { useToast } from "@/components/ui/use-toast";
import { FREE_MODULES, PRO_MODULES } from "@/components/dashboard/module-list";
import type { BotConfig } from "@/components/dashboard/bot-types";

export default function BotModulesPage() {
  const { config, saving, saved, updateAndSave } = useBotConfig();
  const { toast } = useToast();

  if (!config) return <LoadingScreen />;

  const base = `/dashboard/bot/${config.id}`;
  const isPro = config.plan === "PRO" || config.plan === "MANAGED";

  const toggle = async (key: keyof BotConfig) => {
    if (saving) return;
    const result = await updateAndSave(key, !config[key]);
    if (!result.ok) {
      toast({ title: "Erreur lors de la sauvegarde", description: result.error ?? "Une erreur est survenue.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        <PageHeader
          icon={<Puzzle className="size-4" />}
          title="Modules"
          subtitle="Active ou désactive les fonctionnalités de ton bot — sauvegarde automatique"
          status={config.status}
        />
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground/60 shrink-0">
          {saving && <Loader2 className="size-3 animate-spin" />}
          {saved && !saving && <Check className="size-3 text-green-500" />}
          {saving ? "sauvegarde…" : saved ? "enregistré" : ""}
        </div>
      </div>

      <div className="space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-green-500/70 pt-2">— modules gratuits —</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {FREE_MODULES.map((m) => (
            <ModuleToggle
              key={m.key}
              icon={m.icon}
              label={m.label}
              description={m.description}
              enabled={Boolean(config[m.key])}
              onToggle={() => toggle(m.key)}
              configHref={`${base}/${m.path}`}
            />
          ))}
        </div>

        <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70 pt-4">— modules pro —</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {PRO_MODULES.map((m) => (
            <ModuleToggle
              key={m.key}
              icon={m.icon}
              label={m.label}
              description={m.description}
              enabled={Boolean(config[m.key])}
              onToggle={() => toggle(m.key)}
              configHref={`${base}/${m.path}`}
              locked={!isPro}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
