#!/bin/bash
# Run on Ubuntu 24.04 EC2 as ubuntu user (after SSH login)
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/rithikraja61-ctrl/Blood-Donor.git}"
APP_DIR="${APP_DIR:-/home/ubuntu/Blood-Donor}"

echo "==> Installing Docker..."
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl git
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker ubuntu
fi

echo "==> Cloning/updating repository..."
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git pull origin main
else
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

if [ ! -f .env ]; then
  echo "==> Creating .env from .env.production.example — EDIT SECRETS before production use!"
  cp .env.production.example .env
fi

echo "==> Building and starting production stack..."
docker compose -f docker-compose.prod.yml up -d --build

echo "==> Done. Open https://${SERVER_NAME:-YOUR_SERVER_IP}/ (accept self-signed cert warning)"
docker compose -f docker-compose.prod.yml ps
