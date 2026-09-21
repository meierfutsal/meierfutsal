import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "O binding D1 DB não está disponível. Configure o banco em wrangler.jsonc."
    );
  }

  return drizzle(env.DB, { schema });
}
