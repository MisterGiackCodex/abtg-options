#!/usr/bin/env bash
# ABTG Options deploy to VPS (runs FROM local machine).
# Usage:  ./deploy/deploy.sh
set -euo pipefail

REMOTE="${REMOTE:-root@144.91.90.41}"
KEY="${KEY:-$HOME/.ssh/vps_deploy}"
REMOTE_DIR="/var/www/abtg-options"
DOMAIN="opzioni.mistergiack.dev"

echo "→ Sync source to $REMOTE:$REMOTE_DIR"
rsync -az --delete \
  --exclude node_modules --exclude .next --exclude .git \
  --exclude demo/dist \
  -e "ssh -i $KEY -o StrictHostKeyChecking=no" \
  ./ "$REMOTE:$REMOTE_DIR/"

echo "→ Build & start container"
ssh -i "$KEY" "$REMOTE" "cd $REMOTE_DIR && docker compose up -d --build"

echo "→ Install nginx site"
ssh -i "$KEY" "$REMOTE" "
  cp $REMOTE_DIR/deploy/nginx-opzioni /etc/nginx/sites-available/opzioni &&
  ln -sf /etc/nginx/sites-available/opzioni /etc/nginx/sites-enabled/opzioni &&
  nginx -t && systemctl reload nginx
"

echo "→ Done. https://$DOMAIN"
