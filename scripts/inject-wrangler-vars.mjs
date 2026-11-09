// Post-build script: injects Supabase env vars into the generated wrangler.json.
// Cloudflare Workers need process.env vars defined as bindings in the config.
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const wranglerPath = join(__dirname, "..", ".output", "server", "wrangler.json");

const config = JSON.parse(readFileSync(wranglerPath, "utf8"));

config.vars = {
  SUPABASE_URL:
    process.env.SUPABASE_URL || "https://kdxenqerlbpypinupzmq.supabase.co",
  SUPABASE_PUBLISHABLE_KEY:
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    "sb_publishable_3e76awQFJFklYgm1oljRYA_CzN4jVuj",
};

writeFileSync(wranglerPath, JSON.stringify(config, null, 2));
console.log("Injected Supabase vars into wrangler.json");