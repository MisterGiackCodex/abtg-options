#!/usr/bin/env bash
# ABTG Options deploy to VPS (runs FROM local machine).
# Usage:  ./deploy/deploy.sh
set -euo pipefail

REMOTE="${REMOTE:-root@144.91.90.41}"
KEY="${KEY:-${HOME}/.ssh/vps_deploy}"
REMOTE_DIR="/var/www/abtg-options"
DOMAIN="opzioni.mistergiack.dev"

do_ssh() {
  ssh -i "$KEY" -o StrictHostKeyChecking=no "$REMOTE" "$@"
}

echo "→ Creating remote directory"
do_ssh "mkdir -p $REMOTE_DIR"

echo "→ Packing source (excluding node_modules, .next, .git, demo/dist)"
tar -czf /tmp/abtg-options-deploy.tar.gz \
  --exclude=node_modules --exclude=.next --exclude=.git \
  --exclude=demo/dist --exclude=out \
  -C "$(pwd)" .

echo "→ Uploading to $REMOTE:$REMOTE_DIR"
scp -i "$KEY" -o StrictHostKeyChecking=no /tmp/abtg-options-deploy.tar.gz "$REMOTE:/tmp/abtg-options-deploy.tar.gz"

echo "→ Extracting on remote"
do_ssh "cd $REMOTE_DIR && rm -rf app components hooks lib deploy demo docker-compose.yml Dockerfile .dockerignore next.config.js package.json package-lock.json postcss.config.js tailwind.config.ts tsconfig.json && tar -xzf /tmp/abtg-options-deploy.tar.gz && rm /tmp/abtg-options-deploy.tar.gz"

echo "→ Build & start container"
do_ssh "cd $REMOTE_DIR && docker compose up -d --build"

echo "→ Install nginx site"
do_ssh "cp $REMOTE_DIR/deploy/nginx-opzioni /etc/nginx/sites-available/opzioni && ln -sf /etc/nginx/sites-available/opzioni /etc/nginx/sites-enabled/opzioni && nginx -t && systemctl reload nginx"

rm -f /tmp/abtg-options-deploy.tar.gz

echo "→ Done. https://$DOMAIN"
