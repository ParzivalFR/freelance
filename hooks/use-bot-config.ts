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
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!botId) return;
    fetch(`/api/bot/config?botId=${botId}`)
      .then((r) => r.json())
      .then((data) => setConfig({ ...data, config: data.config ?? {} }));
  }, [botId]);

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

  const save = useCallback(async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch("/api/bot/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        const data = await res.json();
        setConfig({ ...data, config: data.config ?? {} });
        setIsDirty(false);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [config]);

  return { config, setConfig, saving, saved, isDirty, update, updateModuleConfig, save };
}
