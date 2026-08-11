#!/usr/bin/env bash
# Deploy dkochnev.com (Vite SPA) to Selectel server.
# Usage:   ./_deploy/deploy.sh             # full: build + rsync
#          ./_deploy/deploy.sh --no-build  # skip vite build, just rsync existing dist/
set -euo pipefail

SERVER="root@135.106.146.200"
REMOTE_DIR="/opt/dkochnev/site"
LOCAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"

SKIP_BUILD=0
if [[ "${1:-}" == "--no-build" ]]; then
  SKIP_BUILD=1
fi

cd "$LOCAL_DIR"

if [[ $SKIP_BUILD -eq 0 ]]; then
  echo "==> Building (npm run build)…"
  npm run build
fi

if [[ ! -d "dist" ]]; then
  echo "ERROR: dist/ not found. Run without --no-build first." >&2
  exit 1
fi

BUNDLE=$(grep -oE 'index-[A-Za-z0-9]+\.js' dist/index.html | head -1)
echo "==> Bundle to deploy: ${BUNDLE}"

echo "==> Rsync → ${SERVER}:${REMOTE_DIR}"
# sitemap.xml, rss.xml and llms.txt are generated ON THE SERVER from the
# live database (cron -> /usr/local/sbin/dkochnev-seo-gen). Excluding them
# keeps --delete from wiping fresh files and replacing them with stale ones.
rsync -avz --delete \
  --exclude=sitemap.xml --exclude=rss.xml --exclude=llms.txt \
  dist/ "${SERVER}:${REMOTE_DIR}/"

echo "==> Verifying remote bundle…"
REMOTE_BUNDLE=$(ssh "$SERVER" "grep -oE 'index-[A-Za-z0-9]+\\.js' ${REMOTE_DIR}/index.html | head -1")
if [[ "$BUNDLE" != "$REMOTE_BUNDLE" ]]; then
  echo "WARN: local bundle=${BUNDLE}, remote=${REMOTE_BUNDLE}" >&2
fi

echo "==> Live check…"
SERVED=$(curl -s https://dkochnev.com/ | grep -oE 'index-[A-Za-z0-9]+\.js' | head -1 || true)
echo "    served via https://dkochnev.com/  → ${SERVED}"

if [[ "$SERVED" == "$BUNDLE" ]]; then
  echo "==> ✅ Deploy OK — site is serving the fresh bundle."
else
  echo "==> ⚠️ Served bundle differs (cache?). Try: curl -I https://dkochnev.com/ ; reload."
fi
