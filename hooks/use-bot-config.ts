"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { BotConfig, ModuleConfig } from "@/components/dashboard/bot-types";

export function useBotConfig() {
  const params = useParams();
  const botId = params?.botId as string | undefined;

  const [config, setConfig] = useState<BotConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const fetchConfig = useCallback(() => {
    if (!botId) return;
    fetch(`/api/bot/config?botId=${botId}`)
      .then((r) => r.json())
      .then((data) => setConfig({ ...data, config: data.config ?? {}, workerCommand: null }));
  }, [botId]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const update = useCallback(
    (key: keyof BotConfig, value: unknown) => {
      setConfig((prev) => (prev ? { ...prev, [key]: value } : prev));
      setIsDirty(true);
    },
    []
  );

  const updateModuleConfig = useCallback(
    (key: keyof ModuleConfig, value: unknown) => {
      setConfig((prev) =>
        prev ? { ...prev, config: { ...prev.config, [key]: value } } : prev
      );
      setIsDirty(true);
    },
    []
  );

  const save = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    if (!config) return { ok: false, error: "Config non chargée" };
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/bot/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        const data = await res.json();
        // workerCommand est "consommé" côté serveur — on le remet à null
        // pour éviter qu'il soit renvoyé dans le prochain save et déclenche
        // un second RESTART inutile.
        setConfig({ ...data, config: data.config ?? {}, workerCommand: null });
        setIsDirty(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        return { ok: true };
      } else {
        const errData = await res.json().catch(() => ({}));
        const errorMsg = (errData as { error?: string }).error ?? `Erreur ${res.status}`;
        setSaveError(errorMsg);
        // Re-fetch depuis le serveur pour resynchroniser l'état réel
        fetchConfig();
        return { ok: false, error: errorMsg };
      }
    } catch (e) {
      const errorMsg = "Erreur réseau";
      setSaveError(errorMsg);
      return { ok: false, error: errorMsg };
    } finally {
      setSaving(false);
    }
  }, [config, fetchConfig]);

  return { config, setConfig, saving, saved, saveError, isDirty, update, updateModuleConfig, save };
}
