"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Coins, Save, ChevronDown, ChevronUp as ChevronUpIcon } from "lucide-react";
import { PageHeader, LoadingScreen, CyberInput } from "@/components/dashboard/cyber-ui";
import { Switch } from "@/components/ui/switch";
import { useBotConfig } from "@/hooks/use-bot-config";
import { useDiscordUsers } from "@/hooks/use-discord-users";
import { useToast } from "@/components/ui/use-toast";

interface WalletEntry {
  id: string;
  userId: string;
  guildId: string;
  balance: number;
  bank: number;
  totalEarned: number;
  updatedAt: string;
}

interface EconomyStats {
  totalCoins: number;
  activeMembers: number;
  totalMembers: number;
}

const MEDAL: Record<number, string> = {
  1: "text-yellow-400",
  2: "text-slate-400",
  3: "text-amber-600",
};

export default function EconomyPage() {
  const params = useParams();
  const botId = params?.botId as string;
  const { config, saving, saved, updateModuleConfig, save } = useBotConfig();
  const { toast } = useToast();

  const [configOpen, setConfigOpen] = useState(false);
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [stats, setStats] = useState<EconomyStats>({ totalCoins: 0, activeMembers: 0, totalMembers: 0 });
  const [loading, setLoading] = useState(true);

  // Give coins modal state
  const [giveUserId, setGiveUserId] = useState("");
  const [giveGuildId, setGiveGuildId] = useState("");
  const [giveAmount, setGiveAmount] = useState("");
  const [givingCoins, setGivingCoins] = useState(false);

  // Reset wallet state
  const [resetUserId, setResetUserId] = useState("");
  const [resetGuildId, setResetGuildId] = useState("");
  const [resettingWallet, setResettingWallet] = useState(false);

  const walletUserIds = wallets.map((w) => w.userId);
  const { users: discordUsers } = useDiscordUsers(botId, walletUserIds);

  const fetchData = useCallback(async () => {
    if (!botId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bot/economy?botId=${botId}`);
      const data = await res.json();
      setWallets(data.wallets ?? []);
      setStats(data.stats ?? { totalCoins: 0, activeMembers: 0, totalMembers: 0 });
    } finally {
      setLoading(false);
    }
  }, [botId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGiveCoins = async () => {
    if (!giveUserId || !giveGuildId || !giveAmount) return;
    setGivingCoins(true);
    try {
      const res = await fetch("/api/bot/economy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId,
          action: "give",
          userId: giveUserId,
          guildId: giveGuildId,
          amount: parseInt(giveAmount),
        }),
      });
      if (res.ok) {
        toast({ title: "Coins envoyés", description: `${giveAmount} coins ajoutés à ${giveUserId}` });
        setGiveUserId("");
        setGiveGuildId("");
        setGiveAmount("");
        fetchData();
      } else {
        toast({ title: "Erreur", description: "Impossible d'envoyer les coins", variant: "destructive" });
      }
    } finally {
      setGivingCoins(false);
    }
  };

  const handleResetWallet = async () => {
    if (!resetUserId || !resetGuildId) return;
    setResettingWallet(true);
    try {
      const res = await fetch("/api/bot/economy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId,
          action: "reset",
          userId: resetUserId,
          guildId: resetGuildId,
        }),
      });
      if (res.ok) {
        toast({ title: "Wallet réinitialisé", description: `Wallet de ${resetUserId} supprimé` });
        setResetUserId("");
        setResetGuildId("");
        fetchData();
      } else {
        toast({ title: "Erreur", description: "Impossible de réinitialiser le wallet", variant: "destructive" });
      }
    } finally {
      setResettingWallet(false);
    }
  };

  if (!config || (loading && wallets.length === 0)) return <LoadingScreen />;

  const currencyEmoji = config.config.currencyEmoji ?? "🪙";
  const currencyName = config.config.currencyName ?? "coins";

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Coins className="size-4" />}
        title="Economy"
        subtitle="Système de monnaie virtuelle pour ton serveur"
        status={config.status}
      />

      {/* Config section */}
      <div className="rounded-xl border border-dashed bg-card">
        <button
          onClick={() => setConfigOpen((o) => !o)}
          className="flex w-full items-center justify-between px-4 py-3"
        >
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            ⚙ configuration
          </span>
          {configOpen ? (
            <ChevronUpIcon className="size-3.5 text-muted-foreground/50" />
          ) : (
            <ChevronDown className="size-3.5 text-muted-foreground/50" />
          )}
        </button>
        {configOpen && (
          <div className="space-y-3 border-t border-dashed px-4 pb-4 pt-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— monnaie —</p>
            <div className="grid grid-cols-2 gap-2">
              <CyberInput
                label="currency_name"
                value={config.config.currencyName ?? ""}
                onChange={(v) => updateModuleConfig("currencyName", v || undefined)}
                placeholder="coins"
              />
              <CyberInput
                label="currency_emoji"
                value={config.config.currencyEmoji ?? ""}
                onChange={(v) => updateModuleConfig("currencyEmoji", v || undefined)}
                placeholder="🪙"
              />
            </div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— récompenses —</p>
            <div className="grid grid-cols-3 gap-2">
              <CyberInput
                label="daily_amount"
                value={String(config.config.dailyAmount ?? "")}
                onChange={(v) => updateModuleConfig("dailyAmount", v ? Number(v) : undefined)}
                placeholder="100"
              />
              <CyberInput
                label="weekly_amount"
                value={String(config.config.weeklyAmount ?? "")}
                onChange={(v) => updateModuleConfig("weeklyAmount", v ? Number(v) : undefined)}
                placeholder="500"
              />
              <CyberInput
                label="work_cooldown (h)"
                value={String(config.config.workCooldownHours ?? "")}
                onChange={(v) => updateModuleConfig("workCooldownHours", v ? Number(v) : undefined)}
                placeholder="4"
              />
            </div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— jeux —</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] text-foreground">allow_gambling</p>
                <p className="font-mono text-[9px] text-muted-foreground/60">
                  Activer coinflip, slots et rob
                </p>
              </div>
              <Switch
                checked={config.config.allowGambling ?? true}
                onCheckedChange={(v) => updateModuleConfig("allowGambling", v)}
                className="scale-75"
              />
            </div>
            <CyberInput
              label="max_bet"
              value={String(config.config.maxBet ?? "")}
              onChange={(v) => updateModuleConfig("maxBet", v ? Number(v) : undefined)}
              placeholder="10000"
            />
            <div className="flex justify-end pt-1">
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg border border-dashed px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
              >
                <Save className="size-3.5" />
                {saved ? "✓ saved" : saving ? "saving..." : "save_config"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-dashed px-4 py-3">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            coins en circulation
          </p>
          <p className="mt-1 font-mono text-2xl font-bold">
            {stats.totalCoins.toLocaleString("fr-FR")} {currencyEmoji}
          </p>
        </div>
        <div className="rounded-lg border border-dashed px-4 py-3">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            membres actifs (7j)
          </p>
          <p className="mt-1 font-mono text-2xl font-bold">{stats.activeMembers}</p>
        </div>
        <div className="rounded-lg border border-dashed px-4 py-3">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            membres total
          </p>
          <p className="mt-1 font-mono text-2xl font-bold">{stats.totalMembers}</p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="overflow-hidden rounded-lg border border-dashed">
        <div className="grid grid-cols-[2.5rem_1fr_6rem_6rem] gap-3 border-b border-dashed px-4 py-2">
          {["#", "utilisateur", "portefeuille", "banque"].map((h) => (
            <span
              key={h}
              className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/50"
            >
              {h}
            </span>
          ))}
        </div>

        {wallets.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-mono text-sm text-muted-foreground/50">
              {loading ? "Chargement..." : "Aucun wallet trouvé"}
            </p>
          </div>
        ) : (
          wallets.map((w, i) => {
            const rank = i + 1;
            return (
              <div
                key={w.id}
                className="group grid grid-cols-[2.5rem_1fr_6rem_6rem] items-center gap-3 border-b border-dashed px-4 py-3 last:border-b-0 transition hover:bg-muted/30"
              >
                <span
                  className={`font-mono text-sm font-bold ${
                    MEDAL[rank] ?? "text-muted-foreground/40"
                  }`}
                >
                  {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : `#${rank}`}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-foreground" title={w.userId}>
                    {discordUsers[w.userId]?.displayName ?? w.userId}
                  </p>
                  <p className="font-mono text-[9px] text-muted-foreground/40">
                    total gagné: {currencyEmoji} {w.totalEarned.toLocaleString("fr-FR")}
                  </p>
                </div>
                <span className="font-mono text-sm font-bold text-yellow-400">
                  {currencyEmoji} {w.balance.toLocaleString("fr-FR")}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {currencyEmoji} {w.bank.toLocaleString("fr-FR")}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Admin actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Give coins */}
        <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            💰 donner des coins
          </p>
          <CyberInput
            label="user_id"
            value={giveUserId}
            onChange={setGiveUserId}
            placeholder="Discord user ID"
          />
          <CyberInput
            label="guild_id"
            value={giveGuildId}
            onChange={setGiveGuildId}
            placeholder="Discord guild ID"
          />
          <CyberInput
            label="montant"
            value={giveAmount}
            onChange={setGiveAmount}
            placeholder="1000"
          />
          <button
            onClick={handleGiveCoins}
            disabled={givingCoins || !giveUserId || !giveGuildId || !giveAmount}
            className="w-full rounded-lg border border-dashed px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
          >
            {givingCoins ? "envoi..." : `donner ${currencyEmoji} ${currencyName}`}
          </button>
        </div>

        {/* Reset wallet */}
        <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            🗑 reset un wallet
          </p>
          <CyberInput
            label="user_id"
            value={resetUserId}
            onChange={setResetUserId}
            placeholder="Discord user ID"
          />
          <CyberInput
            label="guild_id"
            value={resetGuildId}
            onChange={setResetGuildId}
            placeholder="Discord guild ID"
          />
          <button
            onClick={handleResetWallet}
            disabled={resettingWallet || !resetUserId || !resetGuildId}
            className="w-full rounded-lg border border-dashed border-red-500/30 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-red-500/60 transition hover:bg-red-500/10 hover:text-red-500 disabled:opacity-40"
          >
            {resettingWallet ? "suppression..." : "reset wallet"}
          </button>
        </div>
      </div>
    </div>
  );
}
