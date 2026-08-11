# dkochnev.com — Deploy

Static Vite SPA on the **Selectel shared server** (also hosts makemelook, themono,
neurin, contentos, ohmybet). Talks to **Supabase** externally — no backend service
on the server, no database, no MinIO. Just `nginx` serving `/opt/dkochnev/site/`.

## Quick reference

```
Server:     ssh root@135.106.146.200
Site root:  /opt/dkochnev/site/          # contents of vite `dist/`
nginx:      /etc/nginx/sites-available/dkochnev → sites-enabled/dkochnev
TLS:        Let's Encrypt, certbot --nginx, auto-renew via systemd timer
Domain:     dkochnev.com  (apex covered)  + www.dkochnev.com (pending DNS cleanup)
Registrar:  reg.ru (NS: ns1.reg.ru, ns2.reg.ru)
```

## Deploy

From this folder on the Mac:

```bash
./deploy.sh              # builds with `npm run build`, then rsyncs dist/ to server
./deploy.sh --no-build   # rsyncs existing dist/ (e.g. after a manual build)
```

The script:
1. Runs `npm run build`
2. `rsync -avz --delete dist/ root@135.106.146.200:/opt/dkochnev/site/`
3. Verifies remote bundle hash and curls `https://dkochnev.com/` to confirm

No nginx restart needed — static files; immutable hashed assets just appear.

## Initial setup history (May 12, 2026)

We migrated from Google Cloud Run (project `dkochnev-site`) to Selectel after
GCP billing was disabled and the Cloud Run service started returning 503.

Steps executed (record-of-truth — re-running these is safe, idempotent):

```bash
# 1. Server prep
ssh root@135.106.146.200 "mkdir -p /opt/dkochnev/site /var/www/certbot"

# 2. Initial bundle upload
rsync -avz --delete dist/ root@135.106.146.200:/opt/dkochnev/site/

# 3. nginx vhost
scp _deploy/nginx-dkochnev.conf root@135.106.146.200:/etc/nginx/sites-available/dkochnev
ssh root@135.106.146.200 "ln -sf /etc/nginx/sites-available/dkochnev /etc/nginx/sites-enabled/dkochnev \
                          && nginx -t && systemctl reload nginx"

# 4. DNS at reg.ru (manual)
#    A     @     135.106.146.200   TTL 300
#    A     www   135.106.146.200   TTL 300
#    (removed old: A → 216.239.32.21..38 and CNAME www → ghs.googlehosted.com)

# 5. SSL — only after DNS propagates
ssh root@135.106.146.200 "certbot --nginx -d dkochnev.com -d www.dkochnev.com \
    --email leomih659@gmail.com --agree-tos --no-eff-email --redirect --non-interactive"
```

## Operational notes

- **Supabase env-vars are baked into the bundle at build time** (`VITE_SUPABASE_*`).
  They live in `vite.config.ts` reading `import.meta.env`. If you change project
  or rotate the anon key, rebuild and redeploy — there is no runtime config.
- **Image uploads** (linkhub icons, project icons, post covers) go to Supabase
  Storage bucket `blog-images`, not to the server. The server stores zero user data.
- **Logs** — nginx access/error in `/var/log/nginx/`. No app logs (no app).
- **What lives in the same `/etc/nginx/sites-enabled/`** (do NOT modify):
  contentos, demo, mml-saas, neurin, neurin-dev, ohmybet, themono, themono-maintenance.

## Things NOT to touch on the server

- `/opt/makemelook/`, `/opt/themono/`, `/opt/neurin/`, `/opt/contentos/`,
  `/opt/ohmybet/`, `/opt/resources-bot/`, `/opt/minio/`, `/opt/mml-data-import/`
- systemd units for any of the above (`mml-backend.service`, `themono-*`, `minio`, …)
- Postgres roles & DBs: `makemelook_saas_2`, `themono`, etc.
- MinIO buckets owned by other projects
- nginx sites listed above
- `/etc/ssh/sshd_config*`, `ufw`, `fail2ban`
- Never expose extra ports — site is served purely via nginx :80/:443

## TODO (follow-up, when convenient)

- Re-enable GCP billing or formally delete the `dkochnev-site` Cloud Run service +
  Artifact Registry images (cost = 0 once stopped, but cluttered).
- Add `www.dkochnev.com` to the Let's Encrypt certificate once DNS is clean
  (re-run `certbot --nginx -d dkochnev.com -d www.dkochnev.com --expand`).
- Initialise a git repo for `prose-pro-admin-main` and push to a private GitHub —
  currently the only copy is on the Mac (single point of failure).
- Consider release directory pattern (`/opt/dkochnev/releases/<ts>/` + `current`
  symlink) if zero-downtime deploys become important. For static files with
  hashed asset names it's overkill today.
