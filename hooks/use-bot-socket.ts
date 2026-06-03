"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

// Types miroir de bot-engine/src/lib/socket-server.ts
export type BotStatus = "ONLINE" | "OFFLINE" | "STARTING" | "ERROR";

export type BotLogEvent = {
  botId: string;
  message: string;
  level?: "info" | "warn" | "error";
};

export type BotStatusEvent = {
  botId: string;
  status: BotStatus;
};

export type BotLevelUpEvent = {
  botId: string;
  guildId: string;
  userId: string;
  username: string;
  level: number;
};

export type BotModerationEvent = {
  botId: string;
  guildId: string;
  type: string;
  targetId: string;
  moderatorId: string;
  reason: string;
};

type UseBotSocketOptions = {
  botId: string;
  onStatus?: (event: BotStatusEvent) => void;
  onLog?: (event: BotLogEvent) => void;
  onLevelUp?: (event: BotLevelUpEvent) => void;
  onModeration?: (event: BotModerationEvent) => void;
};

export function useBotSocket({
  botId,
  onStatus,
  onLog,
  onLevelUp,
  onModeration,
}: UseBotSocketOptions) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const onStatusRef = useRef(onStatus);
  const onLogRef = useRef(onLog);
  const onLevelUpRef = useRef(onLevelUp);
  const onModerationRef = useRef(onModeration);

  useEffect(() => { onStatusRef.current = onStatus; }, [onStatus]);
  useEffect(() => { onLogRef.current = onLog; }, [onLog]);
  useEffect(() => { onLevelUpRef.current = onLevelUp; }, [onLevelUp]);
  useEffect(() => { onModerationRef.current = onModeration; }, [onModeration]);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL;
    const secret = process.env.NEXT_PUBLIC_SOCKET_SECRET;

    if (!url || !secret || !botId) return;

    // On passe le botId en query pour rejoindre la bonne room côté worker
    const socket = io(url, {
      auth: { token: secret },
      query: { botId },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("bot:status", (event: BotStatusEvent) => onStatusRef.current?.(event));
    socket.on("bot:log", (event: BotLogEvent) => onLogRef.current?.(event));
    socket.on("bot:levelup", (event: BotLevelUpEvent) => onLevelUpRef.current?.(event));
    socket.on("bot:moderation", (event: BotModerationEvent) => onModerationRef.current?.(event));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [botId]);

  return { connected };
}
