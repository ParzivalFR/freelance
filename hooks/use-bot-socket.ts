"use client";

import { useEffect, useRef, useState } from "react";
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

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL;
    const secret = process.env.NEXT_PUBLIC_SOCKET_SECRET;

    if (!url || !secret || !botId) return;

    const socket = io(url, {
      auth: { token: secret },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("bot:status", (event: BotStatusEvent) => {
      if (event.botId !== botId) return;
      onStatus?.(event);
    });

    socket.on("bot:log", (event: BotLogEvent) => {
      if (event.botId !== botId) return;
      onLog?.(event);
    });

    socket.on("bot:levelup", (event: BotLevelUpEvent) => {
      if (event.botId !== botId) return;
      onLevelUp?.(event);
    });

    socket.on("bot:moderation", (event: BotModerationEvent) => {
      if (event.botId !== botId) return;
      onModeration?.(event);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [botId]);

  return { connected };
}
