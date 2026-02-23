#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
#  RentFreely — Oracle Cloud Server Setup
#
#  One-command setup for your Synkronus server on Oracle Cloud
#  Always Free ARM instance (or any Ubuntu/Debian server).
#
#  What this script does:
#    1. Installs Docker & Docker Compose
#    2. Authenticates with GitHub Container Registry (GHCR)
#    3. Generates strong random secrets
#    4. Creates the .env and init-db.sql files
#    5. Pulls and starts the Synkronus + PostgreSQL stack
#    6. Optionally installs Cloudflare Tunnel for free HTTPS
#
#  Usage:
#    # On your Oracle Cloud VM (Ubuntu 22.04+ or Debian 12+):
#    curl -fsSL https://raw.githubusercontent.com/najuna-brian/ode-rentfreely/main/deploy/setup.sh | bash
#
#    # Or clone the repo first:
#    git clone https://github.com/najuna-brian/ode-rentfreely.git
#    cd ode-rentfreely/deploy
#    chmod +x setup.sh
#    ./setup.sh
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

# ── Colours ──────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'
YELLOW='\033[1;33m'; BOLD='\033[1m'; NC='\033[0m'
step()  { echo -e "\n${CYAN}▸ $1${NC}"; }
ok()    { echo -e "${GREEN}  ✓ $1${NC}"; }
warn()  { echo -e "${YELLOW}  ⚠ $1${NC}"; }
fail()  { echo -e "${RED}  ✗ $1${NC}"; exit 1; }

echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   RentFreely — Oracle Cloud Server Setup     ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"

# ── Configuration ────────────────────────────────────────────────
DEPLOY_DIR="${HOME}/rentfreely-server"
GITHUB_OWNER="${GITHUB_OWNER:-najuna-brian}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

# ── Step 1: Install Docker ──────────────────────────────────────
step "Checking Docker installation…"
if command -v docker &>/dev/null; then
  ok "Docker is already installed: $(docker --version)"
else
  step "Installing Docker…"
  curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
  sudo sh /tmp/get-docker.sh
  rm /tmp/get-docker.sh
  sudo usermod -aG docker "$USER"
  ok "Docker installed: $(docker --version)"
  warn "You may need to log out and back in for Docker group to take effect."
  warn "If docker commands fail below, run: newgrp docker"
fi

# Ensure docker compose is available
if docker compose version &>/dev/null; then
  ok "Docker Compose available: $(docker compose version --short)"
else
  fail "Docker Compose not found. Install it with: sudo apt install docker-compose-plugin"
fi

# ── Step 2: Create deployment directory ──────────────────────────
step "Setting up deployment directory: ${DEPLOY_DIR}"
mkdir -p "${DEPLOY_DIR}"
cd "${DEPLOY_DIR}"
ok "Working in ${DEPLOY_DIR}"

# ── Step 3: Authenticate with GHCR (for private repo) ───────────
step "Authenticating with GitHub Container Registry…"
echo ""
echo -e "${BOLD}Your repo is private, so we need a GitHub Personal Access Token (PAT)${NC}"
echo -e "  Create one at: ${CYAN}https://github.com/settings/tokens${NC}"
echo -e "  Required scopes: ${BOLD}read:packages${NC}"
echo ""

if [ -z "${GITHUB_TOKEN:-}" ]; then
  read -rp "  GitHub username [${GITHUB_OWNER}]: " GH_USER
  GH_USER="${GH_USER:-${GITHUB_OWNER}}"
  read -rsp "  GitHub Personal Access Token (PAT): " GH_TOKEN
  echo ""
else
  GH_USER="${GITHUB_OWNER}"
  GH_TOKEN="${GITHUB_TOKEN}"
fi

echo "${GH_TOKEN}" | docker login ghcr.io -u "${GH_USER}" --password-stdin
ok "Authenticated with ghcr.io"

# ── Step 4: Generate secrets ────────────────────────────────────
step "Generating secure random secrets…"
JWT_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=')
POSTGRES_ROOT_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=')
ADMIN_PASSWORD=$(openssl rand -base64 16 | tr -d '/+=')
ok "Secrets generated"

echo ""
echo -e "${BOLD}  ┌─────────────────────────────────────────────┐${NC}"
echo -e "${BOLD}  │  SAVE THESE CREDENTIALS SOMEWHERE SAFE!     │${NC}"
echo -e "${BOLD}  ├─────────────────────────────────────────────┤${NC}"
echo -e "${BOLD}  │  Admin username:  ${GREEN}admin${NC}${BOLD}                      │${NC}"
echo -e "${BOLD}  │  Admin password:  ${GREEN}${ADMIN_PASSWORD}${NC}${BOLD}  │${NC}"
echo -e "${BOLD}  └─────────────────────────────────────────────┘${NC}"
echo ""

# ── Step 5: Create .env file ────────────────────────────────────
step "Creating .env configuration…"
cat > "${DEPLOY_DIR}/.env" << EOF
# RentFreely / Synkronus — Production Environment
# Generated by setup.sh on $(date -Iseconds)

GITHUB_OWNER=${GITHUB_OWNER}
IMAGE_TAG=${IMAGE_TAG}

POSTGRES_ROOT_PASSWORD=${POSTGRES_ROOT_PASSWORD}

DB_USER=synkronus_user
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=synkronus

JWT_SECRET=${JWT_SECRET}

ADMIN_USERNAME=admin
ADMIN_PASSWORD=${ADMIN_PASSWORD}

LOG_LEVEL=info
EOF
chmod 600 "${DEPLOY_DIR}/.env"
ok "Created .env (permissions: 600)"

# ── Step 6: Create init-db.sql ──────────────────────────────────
step "Creating database init script…"
cat > "${DEPLOY_DIR}/init-db.sql" << EOF
-- Auto-generated by setup.sh
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'synkronus_user') THEN
    CREATE ROLE synkronus_user WITH LOGIN PASSWORD '${DB_PASSWORD}';
  END IF;
END
\$\$;

SELECT 'CREATE DATABASE synkronus OWNER synkronus_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'synkronus')
\\gexec

GRANT ALL PRIVILEGES ON DATABASE synkronus TO synkronus_user;
EOF
ok "Created init-db.sql"

# ── Step 7: Create docker-compose.yml ───────────────────────────
step "Creating docker-compose.yml…"
cat > "${DEPLOY_DIR}/docker-compose.yml" << 'COMPOSEOF'
services:
  synkronus:
    image: ghcr.io/${GITHUB_OWNER:-najuna-brian}/synkronus:${IMAGE_TAG:-latest}
    container_name: synkronus
    ports:
      - "80:80"
    environment:
      DB_CONNECTION: "postgres://${DB_USER:-synkronus_user}:${DB_PASSWORD}@postgres:5432/${DB_NAME:-synkronus}?sslmode=disable"
      JWT_SECRET: "${JWT_SECRET}"
      PORT: "8080"
      LOG_LEVEL: "${LOG_LEVEL:-info}"
      ADMIN_USERNAME: "${ADMIN_USERNAME:-admin}"
      ADMIN_PASSWORD: "${ADMIN_PASSWORD}"
      APP_BUNDLE_PATH: "/app/data/app-bundles"
      MAX_VERSIONS_KEPT: "5"
    volumes:
      - app-bundles:/app/data/app-bundles
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "-O", "-", "http://127.0.0.1/api/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 15s
    networks:
      - synkronus-net

  postgres:
    image: postgres:17
    container_name: synkronus-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: "${POSTGRES_ROOT_PASSWORD}"
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init-db.sql:ro
    expose:
      - "5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - synkronus-net

volumes:
  postgres-data:
    driver: local
  app-bundles:
    driver: local

networks:
  synkronus-net:
    driver: bridge
COMPOSEOF
ok "Created docker-compose.yml"

# ── Step 8: Pull and start ──────────────────────────────────────
step "Pulling Docker images…"
docker compose pull
ok "Images pulled"

step "Starting Synkronus stack…"
docker compose up -d
ok "Stack started!"

# Wait for health
step "Waiting for services to become healthy…"
for i in $(seq 1 30); do
  if curl -sf http://localhost/api/health > /dev/null 2>&1; then
    ok "Synkronus is healthy!"
    break
  fi
  if [ "$i" -eq 30 ]; then
    warn "Health check timed out. Check logs with: docker compose logs"
  fi
  sleep 2
done

# ── Step 9: Create update script ────────────────────────────────
step "Creating helper scripts…"

cat > "${DEPLOY_DIR}/update.sh" << 'UPDATEOF'
#!/usr/bin/env bash
# Pull latest image and restart
set -euo pipefail
cd "$(dirname "$0")"
echo "Pulling latest image…"
docker compose pull
echo "Restarting services…"
docker compose up -d --remove-orphans
echo "Cleaning old images…"
docker image prune -f
echo "Done! Check health: curl http://localhost/api/health"
UPDATEOF
chmod +x "${DEPLOY_DIR}/update.sh"
ok "Created update.sh — run this to deploy new versions"

cat > "${DEPLOY_DIR}/logs.sh" << 'LOGSOF'
#!/usr/bin/env bash
# View logs
cd "$(dirname "$0")"
docker compose logs -f "${1:-}"
LOGSOF
chmod +x "${DEPLOY_DIR}/logs.sh"
ok "Created logs.sh — view service logs"

cat > "${DEPLOY_DIR}/backup.sh" << 'BACKUPOF'
#!/usr/bin/env bash
# Backup PostgreSQL database
set -euo pipefail
cd "$(dirname "$0")"
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
echo "Backing up database…"
docker compose exec -T postgres pg_dump -U synkronus_user synkronus > "${BACKUP_DIR}/synkronus-${TIMESTAMP}.sql"
echo "Backup saved to: ${BACKUP_DIR}/synkronus-${TIMESTAMP}.sql"
# Keep only last 7 backups
ls -t "${BACKUP_DIR}"/synkronus-*.sql | tail -n +8 | xargs -r rm
echo "Done!"
BACKUPOF
chmod +x "${DEPLOY_DIR}/backup.sh"
ok "Created backup.sh — backup the database"

# ── Step 10: Cloudflare Tunnel (optional) ────────────────────────
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║              Setup Complete! 🚀              ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BOLD}Your server is running at:${NC}"
echo -e "  • API:    ${GREEN}http://$(hostname -I | awk '{print $1}')/api/health${NC}"
echo -e "  • Portal: ${GREEN}http://$(hostname -I | awk '{print $1}')/${NC}"
echo ""
echo -e "${BOLD}Admin credentials:${NC}"
echo -e "  • Username: ${GREEN}admin${NC}"
echo -e "  • Password: ${GREEN}${ADMIN_PASSWORD}${NC}"
echo ""
echo -e "${BOLD}Deployment directory:${NC} ${DEPLOY_DIR}"
echo -e "${BOLD}Helper scripts:${NC}"
echo -e "  • ${CYAN}./update.sh${NC}  — Pull latest image & restart"
echo -e "  • ${CYAN}./logs.sh${NC}    — View service logs"
echo -e "  • ${CYAN}./backup.sh${NC}  — Backup the database"
echo ""
echo -e "${YELLOW}═══ NEXT STEPS ═══${NC}"
echo ""
echo -e "  1. ${BOLD}Set up HTTPS with Cloudflare Tunnel (free):${NC}"
echo -e "     wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64"
echo -e "     chmod +x cloudflared-linux-arm64"
echo -e "     sudo mv cloudflared-linux-arm64 /usr/local/bin/cloudflared"
echo -e "     cloudflared tunnel login"
echo -e "     cloudflared tunnel create rentfreely"
echo -e "     cloudflared tunnel route dns rentfreely ${BOLD}synkronus.yourdomain.com${NC}"
echo ""
echo -e "     Then create ${CYAN}~/.cloudflared/config.yml${NC}:"
echo -e "       tunnel: <tunnel-id>"
echo -e "       credentials-file: ~/.cloudflared/<tunnel-id>.json"
echo -e "       ingress:"
echo -e "         - hostname: synkronus.yourdomain.com"
echo -e "           service: http://localhost:80"
echo -e "         - service: http_status:404"
echo ""
echo -e "     sudo cloudflared service install"
echo -e "     sudo systemctl enable --now cloudflared"
echo ""
echo -e "  2. ${BOLD}Update the Formulus app to point to your server:${NC}"
echo -e "     Edit: formulus/src/services/ServerConfigService.ts"
echo -e "     Change DEFAULT_SERVER_URL to: ${GREEN}https://synkronus.yourdomain.com${NC}"
echo ""
echo -e "  3. ${BOLD}Upload your RentFreely app bundle:${NC}"
echo -e "     ./synk config set api.url https://synkronus.yourdomain.com/api"
echo -e "     ./synk login --username admin --password ${ADMIN_PASSWORD}"
echo -e "     ./synk app-bundle upload path/to/bundle.zip --activate"
echo ""
