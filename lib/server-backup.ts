// Capture / restauration de la structure d'un serveur Discord via l'API REST
// directement (pas besoin de bot-engine) — même format de snapshot que le
// module "backup" de bot-engine, pour rester interchangeable avec /backup.

interface DiscordRole {
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  mentionable: boolean;
  permissions: string;
  position: number;
  managed: boolean;
}

interface DiscordOverwrite {
  id: string;
  type: 0 | 1; // 0 = role, 1 = member
  allow: string;
  deny: string;
}

interface DiscordChannel {
  id: string;
  type: number;
  name: string;
  topic?: string | null;
  position: number;
  parent_id?: string | null;
  permission_overwrites?: DiscordOverwrite[];
}

export interface SnapshotOverwrite {
  targetType: "role" | "member";
  target: string; // nom du rôle, ou ID du membre
  allow: string;
  deny: string;
}

export interface SnapshotRole {
  name: string;
  color: number;
  hoist: boolean;
  mentionable: boolean;
  permissions: string;
  position: number;
}

export interface SnapshotChannel {
  name: string;
  type: number;
  topic: string | null;
  position: number;
  categoryName: string | null;
  overwrites: SnapshotOverwrite[];
}

export interface Snapshot {
  roles: SnapshotRole[];
  categories: { name: string; position: number; overwrites: SnapshotOverwrite[] }[];
  channels: SnapshotChannel[];
}

const CHANNEL_TYPE_CATEGORY = 4;
const CREATABLE_CHANNEL_TYPES = new Set([0, 2, 5, 13, 15]); // text, voice, announcement, stage, forum

function resolveOverwrites(overwrites: DiscordOverwrite[] | undefined, roles: DiscordRole[]): SnapshotOverwrite[] {
  if (!overwrites) return [];
  const roleById = new Map(roles.map((r) => [r.id, r]));
  return overwrites.map((ow) => {
    if (ow.type === 0) {
      const name = roleById.get(ow.id)?.name;
      return { targetType: "role" as const, target: name === undefined && ow.id ? "@everyone" : (name ?? "@everyone"), allow: ow.allow, deny: ow.deny };
    }
    return { targetType: "member" as const, target: ow.id, allow: ow.allow, deny: ow.deny };
  });
}

export async function captureSnapshot(guildId: string, token: string): Promise<Snapshot> {
  const headers = { Authorization: `Bot ${token}` };
  const [rolesRes, channelsRes] = await Promise.all([
    fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, { headers }),
    fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, { headers }),
  ]);
  if (!rolesRes.ok || !channelsRes.ok) throw new Error("Impossible de contacter l'API Discord");

  const rawRoles = (await rolesRes.json()) as DiscordRole[];
  const rawChannels = (await channelsRes.json()) as DiscordChannel[];

  const roles: SnapshotRole[] = rawRoles
    .filter((r) => r.name !== "@everyone" && !r.managed)
    .map((r) => ({ name: r.name, color: r.color, hoist: r.hoist, mentionable: r.mentionable, permissions: r.permissions, position: r.position }))
    .sort((a, b) => a.position - b.position);

  const categoriesById = new Map(rawChannels.filter((c) => c.type === CHANNEL_TYPE_CATEGORY).map((c) => [c.id, c]));

  const categories = [...categoriesById.values()].map((c) => ({
    name: c.name,
    position: c.position,
    overwrites: resolveOverwrites(c.permission_overwrites, rawRoles),
  }));

  const channels: SnapshotChannel[] = rawChannels
    .filter((c) => CREATABLE_CHANNEL_TYPES.has(c.type))
    .map((c) => ({
      name: c.name,
      type: c.type,
      topic: c.topic ?? null,
      position: c.position,
      categoryName: c.parent_id ? (categoriesById.get(c.parent_id)?.name ?? null) : null,
      overwrites: resolveOverwrites(c.permission_overwrites, rawRoles),
    }));

  return { roles, categories, channels };
}

function overwritesToPayload(overwrites: SnapshotOverwrite[], guildId: string, roleNameMap: Map<string, string>): DiscordOverwrite[] {
  const result: DiscordOverwrite[] = [];
  for (const ow of overwrites) {
    if (ow.targetType === "member") {
      result.push({ id: ow.target, type: 1, allow: ow.allow, deny: ow.deny });
      continue;
    }
    const roleId = ow.target === "@everyone" ? guildId : roleNameMap.get(ow.target);
    if (!roleId) continue;
    result.push({ id: roleId, type: 0, allow: ow.allow, deny: ow.deny });
  }
  return result;
}

export async function restoreSnapshot(
  guildId: string,
  token: string,
  snapshot: Snapshot,
): Promise<{ roles: number; categories: number; channels: number }> {
  const headers = { Authorization: `Bot ${token}`, "Content-Type": "application/json" };
  const roleNameMap = new Map<string, string>();
  let rolesCreated = 0;

  for (const role of [...snapshot.roles].sort((a, b) => a.position - b.position)) {
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name: role.name, color: role.color, hoist: role.hoist, mentionable: role.mentionable, permissions: role.permissions }),
    });
    if (res.ok) {
      const created = (await res.json()) as { id: string };
      roleNameMap.set(role.name, created.id);
      rolesCreated++;
    }
  }

  const categoryIdMap = new Map<string, string>();
  let categoriesCreated = 0;
  for (const cat of [...snapshot.categories].sort((a, b) => a.position - b.position)) {
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: cat.name.slice(0, 100),
        type: CHANNEL_TYPE_CATEGORY,
        permission_overwrites: overwritesToPayload(cat.overwrites, guildId, roleNameMap),
      }),
    });
    if (res.ok) {
      const created = (await res.json()) as { id: string };
      categoryIdMap.set(cat.name, created.id);
      categoriesCreated++;
    }
  }

  let channelsCreated = 0;
  for (const ch of [...snapshot.channels].sort((a, b) => a.position - b.position)) {
    const supportsTopic = ch.type === 0 || ch.type === 5;
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: ch.name.slice(0, 100),
        type: ch.type,
        parent_id: ch.categoryName ? categoryIdMap.get(ch.categoryName) : undefined,
        ...(supportsTopic && ch.topic ? { topic: ch.topic.slice(0, 1024) } : {}),
        permission_overwrites: overwritesToPayload(ch.overwrites, guildId, roleNameMap),
      }),
    });
    if (res.ok) channelsCreated++;
  }

  return { roles: rolesCreated, categories: categoriesCreated, channels: channelsCreated };
}
