"use client";

import { useState, useRef, useEffect } from "react";

interface DiscordUser {
  username: string;
  displayName: string;
  avatar: string | null;
}

export function useDiscordUsers(botId: string, userIds: string[]) {
  const cache = useRef<Record<string, DiscordUser>>({});
  const [users, setUsers] = useState<Record<string, DiscordUser>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!botId || userIds.length === 0) return;

    const uncached = [...new Set(userIds)].filter((id) => !cache.current[id]);
    if (uncached.length === 0) {
      setUsers({ ...cache.current });
      return;
    }

    setLoading(true);
    fetch("/api/bot/resolve-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ botId, userIds: uncached }),
    })
      .then((res) => res.json())
      .then((data: Record<string, DiscordUser>) => {
        Object.assign(cache.current, data);
        setUsers({ ...cache.current });
      })
      .catch(() => {
        // En cas d'erreur, laisser les IDs bruts s'afficher
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botId, userIds.join(",")]);

  return { users, loading };
}
