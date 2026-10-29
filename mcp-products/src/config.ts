import path from "node:path";
import { fileURLToPath } from "node:url";

const here: string = path.dirname(fileURLToPath(import.meta.url));

process.loadEnvFile(path.resolve(here, "..", ".env"));

function required(name: string): string {
  const value: string | undefined = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export const config = {
  apiUrl: required("TINGLET_API_URL").replace(/\/+$/, ""),
  email: required("TINGLET_ADMIN_EMAIL"),
  password: required("TINGLET_ADMIN_PASSWORD"),
  publicDir: process.env.WEB_PUBLIC_DIR ?? path.resolve(here, "..", "..", "web", "public"),
};
