#!/usr/bin/env bash
# Деплой dkochnev.com (Vite SPA) на общий сервер Hetzner.
# Usage:   ./_deploy/deploy.sh             # сборка + заливка
#          ./_deploy/deploy.sh --no-build  # залить уже собранный dist/
set -euo pipefail

SERVER="root@167.233.109.195"
REMOTE_DIR="/opt/stacks/dkochnev/site"
LOCAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"

SKIP_BUILD=0
if [[ "${1:-}" == "--no-build" ]]; then
  SKIP_BUILD=1
fi

cd "$LOCAL_DIR"

if [[ $SKIP_BUILD -eq 0 ]]; then
  echo "==> Сборка (npm run build)…"
  npm run build
fi

if [[ ! -d "dist" ]]; then
  echo "ERROR: dist/ не найден. Запусти без --no-build." >&2
  exit 1
fi

BUNDLE=$(grep -oE 'index-[A-Za-z0-9]+\.js' dist/index.html | head -1)
echo "==> Бандл: ${BUNDLE}"

echo "==> Заливка → ${SERVER}:${REMOTE_DIR}"
# prerender/, sitemap.xml, rss.xml и llms.txt генерятся НА СЕРВЕРЕ из живой
# базы (cron -> /usr/local/sbin/dkochnev-refresh). Без этих исключений
# --delete снёс бы свежие файлы и подложил устаревшие из локального dist/.
rsync -avz --delete \
  --exclude=prerender --exclude=sitemap.xml --exclude=rss.xml --exclude=llms.txt \
  dist/ "${SERVER}:${REMOTE_DIR}/"

echo "==> Обновляю снапшоты и sitemap из базы…"
ssh "$SERVER" /usr/local/sbin/dkochnev-refresh

echo "==> Сверка бандла на сервере…"
REMOTE_BUNDLE=$(ssh "$SERVER" "grep -oE 'index-[A-Za-z0-9]+\\.js' ${REMOTE_DIR}/index.html | head -1")
if [[ "$BUNDLE" != "$REMOTE_BUNDLE" ]]; then
  echo "WARN: локально=${BUNDLE}, на сервере=${REMOTE_BUNDLE}" >&2
fi

echo "==> Проверка вживую…"
SERVED=$(curl -s --max-time 15 https://dkochnev.com/ | grep -oE 'index-[A-Za-z0-9]+\.js' | head -1 || true)
echo "    https://dkochnev.com/ отдаёт → ${SERVED:-нет ответа}"

if [[ "$SERVED" == "$BUNDLE" ]]; then
  echo "==> ✅ Деплой ОК."
else
  echo "==> ⚠️ Отдаётся другой бандл (кэш?). Проверь: curl -I https://dkochnev.com/"
fi
