#!/usr/bin/env bash
# Build the app as a standalone Node server (for Raspberry Pi / dietpi).
# Output goes to .output-node/ — run `node .output-node/server/index.mjs`.
set -euo pipefail
cd "$(dirname "$0")/.."

# Temporarily switch to a Node preset build, then restore the original config.
cp vite.config.ts vite.config.ts.bak
trap 'mv vite.config.ts.bak vite.config.ts' EXIT

cat > vite.config.ts <<'EOF'
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: { server: { entry: "server" } },
  nitro: { preset: "node", output: { dir: ".output-node" } },
});
EOF

npm run build