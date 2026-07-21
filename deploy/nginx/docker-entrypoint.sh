#!/bin/sh
set -e

SERVER_NAME="${SERVER_NAME:-localhost}"
BACKEND_HOST="${BACKEND_HOST:-http://app:8080}"
CERT_DIR="/etc/nginx/certs"

mkdir -p "$CERT_DIR"

LE_LIVE="/etc/letsencrypt/live/${SERVER_NAME}"
if [ -f "$LE_LIVE/fullchain.pem" ] && [ -f "$LE_LIVE/privkey.pem" ]; then
  echo "Using Let's Encrypt certificate for ${SERVER_NAME}..."
  cp "$LE_LIVE/fullchain.pem" "$CERT_DIR/server.crt"
  cp "$LE_LIVE/privkey.pem" "$CERT_DIR/server.key"
elif [ ! -f "$CERT_DIR/server.crt" ]; then
  echo "Generating self-signed TLS certificate for ${SERVER_NAME}..."
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$CERT_DIR/server.key" \
    -out "$CERT_DIR/server.crt" \
    -subj "/CN=${SERVER_NAME}/O=BloodDonor/C=IN"
fi

export SERVER_NAME BACKEND_HOST
envsubst '${SERVER_NAME} ${BACKEND_HOST}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
