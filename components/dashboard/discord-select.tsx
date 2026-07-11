"use client";

import { useEffect, useState } from "react";

interface DiscordChannel {
  id: string;
  name: string;
  type: number; // 0 = TEXT, 2 = VOICE
}

interface DiscordRole {
  id: string;
  name: string;
  color: number;
}

interface DiscordData {
  channels: DiscordChannel[];
  roles: DiscordRole[];
}

// Cache partagé : une seule requête par botId, peu importe combien de composants l'utilisent
const discordDataCache = new Map<string, Promise<DiscordData>>();

function fetchDiscordData(botId: string): Promise<DiscordData> {
  if (!discordDataCache.has(botId)) {
    discordDataCache.set(
      botId,
      fetch(`/api/bot/discord-data?botId=${botId}`)
        .then((res) => {
          if (!res.ok) throw new Error(`${res.status}`);
          return res.json() as Promise<DiscordData>;
        })
        .catch((err) => {
          // Invalider le cache en cas d'erreur pour permettre un retry
          discordDataCache.delete(botId);
          throw err;
        })
    );
  }
  return discordDataCache.get(botId)!;
}

function useDiscordData(botId: string) {
  const [data, setData] = useState<DiscordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!botId) return;
    setLoading(true);
    setError(false);
    fetchDiscordData(botId)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [botId]);

  return { data, loading, error };
}

// ─── ChannelSelect ────────────────────────────────────────────────────────────

export function ChannelSelect({
  botId,
  value,
  onChange,
  label,
  placeholder,
  filter = "text",
}: {
  botId: string;
  value: string;
  onChange: (v: string) => void;
  label: string;
  placeholder?: string;
  filter?: "text" | "voice" | "category" | "all";
}) {
  const { data, loading, error } = useDiscordData(botId);

  const channels = (data?.channels ?? []).filter((c) => {
    if (filter === "text") return c.type === 0;
    if (filter === "voice") return c.type === 2;
    if (filter === "category") return c.type === 4;
    return true;
  });

  // Valeur courante reconnue ?
  const knownChannel = channels.find((c) => c.id === value);

  if (loading) {
    return (
      <div className="space-y-1">
        <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          {label}
        </label>
        <div className="w-full rounded-xl border border-dashed bg-card px-3 py-2 font-mono text-xs text-muted-foreground">
          Chargement...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-1">
        <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          {label}
        </label>
        <div className="w-full rounded-xl border border-dashed border-yellow-500/30 bg-yellow-500/5 px-3 py-2 font-mono text-[10px] text-yellow-500/70">
          ⚠ Configure le Server ID dans &ldquo;Identité &amp; Token&rdquo;
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-dashed bg-card px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">— Aucun —</option>
        {/* Si la valeur courante n'est pas dans la liste, on l'affiche quand même */}
        {value && !knownChannel && (
          <option value={value}>{value}</option>
        )}
        {channels.map((c) => (
          <option key={c.id} value={c.id}>
            {c.type === 2 ? "🔊 " : c.type === 4 ? "📁 " : "# "}{c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── RoleSelect ───────────────────────────────────────────────────────────────

export function RoleSelect({
  botId,
  value,
  onChange,
  label,
  placeholder,
}: {
  botId: string;
  value: string;
  onChange: (v: string) => void;
  label: string;
  placeholder?: string;
}) {
  const { data, loading, error } = useDiscordData(botId);

  const roles = data?.roles ?? [];
  const knownRole = roles.find((r) => r.id === value);

  if (loading) {
    return (
      <div className="space-y-1">
        <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          {label}
        </label>
        <div className="w-full rounded-xl border border-dashed bg-card px-3 py-2 font-mono text-xs text-muted-foreground">
          Chargement...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-1">
        <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          {label}
        </label>
        <div className="w-full rounded-xl border border-dashed border-yellow-500/30 bg-yellow-500/5 px-3 py-2 font-mono text-[10px] text-yellow-500/70">
          ⚠ Configure le Server ID dans &ldquo;Identité &amp; Token&rdquo;
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-dashed bg-card px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">— Aucun —</option>
        {value && !knownRole && (
          <option value={value}>{value}</option>
        )}
        {roles.map((r) => (
          <option key={r.id} value={r.id}>
            @ {r.name}
          </option>
        ))}
      </select>
    </div>
  );
}
