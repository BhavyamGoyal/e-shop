import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

const derive = (password: string, salt: string): Promise<Buffer> =>
  new Promise<Buffer>((resolve, reject): void => {
    scrypt(password, salt, KEY_LENGTH, (error: Error | null, key: Buffer): void =>
      error ? reject(error) : resolve(key),
    );
  });

export async function hashPassword(password: string): Promise<string> {
  const salt: string = randomBytes(16).toString("hex");
  const key: Buffer = await derive(password, salt);
  return `${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected: Buffer = Buffer.from(hash, "hex");
  const actual: Buffer = await derive(password, salt);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
