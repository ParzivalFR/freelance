"use client";

import { useState } from "react";
import { Megaphone, Send } from "lucide-react";
import { CyberInput, CyberTextarea, PageHeader, LoadingScreen } from "@/components/dashboard/cyber-ui";
import { Switch } from "@/components/ui/switch";
import { useBotConfig } from "@/hooks/use-bot-config";
import { useParams } from "next/navigation";
import { ChannelSelect } from "@/components/dashboard/discord-select";
import { toast } from "sonner";

const DEFAULT_COLOR = "393a41";

export default function AnnouncePage() {
  const params = useParams();
  const botId = params?.botId as string;
  const { config } = useBotConfig();

  const [channelId, setChannelId] = useState("");
  const [mode, setMode] = useState<"text" | "embed">("text");
  const [content, setContent] = useState("");
  const [embedTitle, setEmbedTitle] = useState("");
  const [embedDescription, setEmbedDescription] = useState("");
  const [embedColor, setEmbedColor] = useState(DEFAULT_COLOR);
  const [embedFooter, setEmbedFooter] = useState("");
  const [embedImageUrl, setEmbedImageUrl] = useState("");
  const [sending, setSending] = useState(false);

  if (!config) return <LoadingScreen />;

  const canSend =
    !!channelId &&
    (mode === "text" ? !!content.trim() : !!(embedTitle.trim() || embedDescription.trim()));

  const send = async () => {
    if (!canSend || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/bot/${botId}/announce`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId,
          mode,
          content: mode === "text" ? content : undefined,
          embed:
            mode === "embed"
              ? {
                  title: embedTitle,
                  description: embedDescription,
                  color: embedColor || DEFAULT_COLOR,
                  footer: embedFooter,
                  imageUrl: embedImageUrl,
                }
              : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur lors de l'envoi");
        return;
      }
      toast.success("Message envoyé avec succès !");
      setContent("");
      setEmbedTitle("");
      setEmbedDescription("");
      setEmbedColor(DEFAULT_COLOR);
      setEmbedFooter("");
      setEmbedImageUrl("");
    } finally {
      setSending(false);
    }
  };

  const colorHex = (embedColor || DEFAULT_COLOR).replace("#", "");
  const previewColor = `#${colorHex}`;

  return (
    <div className="space-y-6 px-5 py-6 md:px-7 lg:px-8">
      <PageHeader
        icon={<Megaphone className="size-4" />}
        title="Annonces"
        subtitle="Envoie un message ou un embed dans n'importe quel salon via ton bot"
        status={config.status}
      />

      <div className="space-y-4">
        {/* Salon cible */}
        <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
          <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— salon cible —</p>
          <ChannelSelect
            botId={botId}
            label="channel_id"
            value={channelId}
            onChange={setChannelId}
            filter="text"
          />
        </div>

        {/* Mode */}
        <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
          <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— type de message —</p>
          <div className="grid grid-cols-2 gap-2">
            {(["text", "embed"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 font-mono text-[10px] uppercase tracking-widest transition ${
                  mode === m
                    ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                    : "border-dashed text-muted-foreground/50 hover:border-blue-500/20 hover:text-muted-foreground"
                }`}
              >
                {m === "text" ? "✉ Texte simple" : "▦ Embed"}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu */}
        {mode === "text" ? (
          <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— message —</p>
            <CyberTextarea
              label="contenu"
              value={content}
              onChange={setContent}
              placeholder="Salut tout le monde ! Voici une annonce importante…"
            />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-blue-500/70">— embed —</p>
            <CyberInput
              label="titre"
              value={embedTitle}
              onChange={setEmbedTitle}
              placeholder="Titre de l'annonce"
            />
            <CyberTextarea
              label="description"
              value={embedDescription}
              onChange={setEmbedDescription}
              placeholder="Contenu de l'annonce…"
            />
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                  couleur (hex sans #)
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="size-7 shrink-0 rounded border border-dashed"
                    style={{ backgroundColor: previewColor }}
                  />
                  <input
                    type="text"
                    value={embedColor}
                    onChange={(e) => setEmbedColor(e.target.value.replace("#", ""))}
                    placeholder={DEFAULT_COLOR}
                    maxLength={6}
                    className="w-full rounded-lg border border-dashed bg-background py-2.5 pl-3 pr-3 font-mono text-sm text-foreground placeholder-muted-foreground/40 outline-hidden transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/10"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground">footer</p>
                <input
                  type="text"
                  value={embedFooter}
                  onChange={(e) => setEmbedFooter(e.target.value)}
                  placeholder="Ton serveur • Annonce"
                  className="w-full rounded-lg border border-dashed bg-background py-2.5 pl-3 pr-3 font-mono text-sm text-foreground placeholder-muted-foreground/40 outline-hidden transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/10"
                />
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {[
                    { label: "📅 Date", value: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) },
                    { label: "🕐 Heure", value: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) },
                    { label: "📅 Date & heure", value: new Date().toLocaleString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) },
                    { label: "📣 Annonce officielle", value: "Annonce officielle" },
                    { label: "⚠️ Important", value: "Important" },
                    { label: "🔔 Mise à jour", value: "Mise à jour" },
                    { label: "📌 Épinglé", value: "Épinglé" },
                  ].map(({ label, value }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setEmbedFooter(embedFooter ? `${embedFooter} • ${value}` : value)}
                      className="rounded border border-dashed px-2 py-0.5 font-mono text-[9px] text-muted-foreground/60 transition hover:border-blue-500/30 hover:text-blue-400"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <CyberInput
              label="image (url, optionnel)"
              value={embedImageUrl}
              onChange={setEmbedImageUrl}
              placeholder="https://..."
            />
          </div>
        )}

        {/* Aperçu Discord */}
        <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">— aperçu_discord —</p>
          <div className="rounded-lg bg-[#313338] p-3 min-h-[60px]">
            {mode === "text" ? (
              content.trim() ? (
                <p className="text-[#dcddde] text-sm whitespace-pre-line">{content}</p>
              ) : (
                <p className="text-[#a3a6aa] text-[11px] italic">Aucun message rédigé…</p>
              )
            ) : (
              !embedTitle.trim() && !embedDescription.trim() ? (
                <p className="text-[#a3a6aa] text-[11px] italic">Aucun contenu d'embed rédigé…</p>
              ) : (
                <div
                  className="rounded overflow-hidden"
                  style={{ borderLeft: `4px solid ${previewColor}` }}
                >
                  <div className="bg-[#2b2d31] p-3 space-y-1.5">
                    {embedTitle.trim() && (
                      <p className="font-semibold text-white text-sm">{embedTitle}</p>
                    )}
                    {embedDescription.trim() && (
                      <p className="text-[#dcddde] text-xs whitespace-pre-line">{embedDescription}</p>
                    )}
                    {embedImageUrl.trim() && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={embedImageUrl} alt="" className="mt-2 max-w-full rounded" />
                    )}
                    {embedFooter.trim() && (
                      <p className="text-[#a3a6aa] text-[10px] pt-1 border-t border-white/5">{embedFooter}</p>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Bouton envoi */}
        <div className="flex justify-end">
          <button
            onClick={send}
            disabled={!canSend || sending}
            className="flex items-center gap-2 rounded-lg border border-dashed px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="size-3.5" />
            {sending ? "envoi_en_cours..." : "envoyer_maintenant"}
          </button>
        </div>
      </div>
    </div>
  );
}
