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

  useEffect(() => {
    if (!botId) return;
    const fetchConfig = () =>
      fetch(`/api/bot/config?botId=${botId}`)
        .then((r) => r.json())
        .then((data) => setConfig({ ...data, config: data.config ?? {} }));
    fetchConfig();
    const interval = setInterval(fetchConfig, 30_000);
    return () => clearInterval(interval);
  }, [botId]);

  const update = useCallback(
    (key: keyof BotConfig, value: unknown) =>
      setConfig((prev) => (prev ? { ...prev, [key]: value } : prev)),
    []
  );

  const updateModuleConfig = useCallback(
    (key: keyof ModuleConfig, value: unknown) =>
      setConfig((prev) =>
        prev ? { ...prev, config: { ...prev.config, [key]: value } } : prev
      ),
    []
  );

  const save = useCallback(async () => {
    if (!config) return;
    setSaving(true);
    try {
      await fetch("/api/bot/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [config]);

  return { config, setConfig, saving, saved, update, updateModuleConfig, save };
}
