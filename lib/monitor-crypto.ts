import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const hex = process.env.MONITOR_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error("MONITOR_ENCRYPTION_KEY must be 64 hex characters (32 bytes)");
  }
  return Buffer.from(hex, "hex");
}

/** Encrypt a plaintext string. Returns `iv:authTag:ciphertext` (all hex). */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/** Decrypt a value produced by `encrypt`. */
export function decrypt(ciphertext: string): string {
  const key = getKey();
  const parts = ciphertext.split(":");
  if (parts.length < 3) throw new Error("Invalid ciphertext format");
  const [ivHex, authTagHex, ...rest] = parts;
  const encryptedHex = rest.join(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

/** Returns true if the value looks like an encrypted blob. */
export function isEncrypted(value: string): boolean {
  return /^[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$/i.test(value);
}

/** Replace the password in a DB URL with *** for display. */
export function maskConnectionString(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.password) {
      parsed.password = "***";
      return parsed.toString();
    }
    return url;
  } catch {
    return url;
  }
}
