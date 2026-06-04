"use client";

import { Lightbulb, Save } from "lucide-react";
import { PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";
import { useBotConfig } from "@/hooks/use-bot-config";
import { useParams } from "next/navigation";
import { ChannelSelect, RoleSelect } from "@/components/dashboard/discord-select";

export default function SuggestionsPage() {
  const params = useParams();
  const botId = params?.botId as string;
  const { config, saving, saved, updateModuleConfig, save } = useBotConfig();

  if (!config) return <LoadingScreen />;
  const cfg = (config.config.suggestions ?? {}) as Record<string, unknown>;
  const update = (k: string, v: unknown) =>
    updateModuleConfig("suggestions" as never, { ...cfg, [k]: v } as never);

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Lightbulb className="size-4" />}
        title="Suggestions"
        subtitle="Système de suggestions avec votes pour/contre"
        status={config.status}
      />

      <div className="space-y-4 rounded-xl border border-dashed bg-card p-4">
        <ChannelSelect
          botId={botId}
          label="salon_suggestions"
          value={String(cfg.channelId ?? "")}
          onChange={(v) => update("channelId", v)}
          filter="text"
        />
        <RoleSelect
          botId={botId}
          label="role_staff_validation"
          value={String(cfg.approveRoleId ?? "")}
          onChange={(v) => update("approveRoleId", v)}
        />
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
