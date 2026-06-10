#!/usr/bin/env bash
#
# Road Trip Bingo - lightweight installer/updater for a Proxmox LXC (or any
# Debian/Ubuntu host). Idempotent: safe to re-run to deploy updates.
#
# Usage (as root, inside the container):
#   bash setup-lxc.sh            # install or update
#   APP_REF=v1.2.0 bash setup-lxc.sh   # pin to a tag/branch/commit
#
set -euo pipefail

# --- Configuration (override via environment) ---------------------------------
REPO_URL="${REPO_URL:-https://github.com/trsdn/roadtripbingo.git}"
APP_DIR="${APP_DIR:-/opt/roadtripbingo}"
APP_USER="${APP_USER:-roadtripbingo}"
APP_REF="${APP_REF:-main}"
NODE_MAJOR="${NODE_MAJOR:-22}"
SERVICE_NAME="roadtripbingo"

log() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
err() { printf '\033[1;31mERROR:\033[0m %s\n' "$*" >&2; }

if [[ "${EUID}" -ne 0 ]]; then
  err "Please run as root (inside the LXC container)."
  exit 1
fi

# --- 1. Base packages ---------------------------------------------------------
log "Installing base packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
# build-essential + python3 are needed to compile the better-sqlite3 native addon
apt-get install -y -qq curl git ca-certificates build-essential python3

# --- 2. Node.js (via NodeSource if missing or too old) ------------------------
need_node=1
if command -v node >/dev/null 2>&1; then
  current_major="$(node -p 'process.versions.node.split(".")[0]')"
  if [[ "${current_major}" -ge 20 ]]; then
    need_node=0
    log "Node.js $(node -v) already present."
  fi
fi
if [[ "${need_node}" -eq 1 ]]; then
  log "Installing Node.js ${NODE_MAJOR}.x from NodeSource..."
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y -qq nodejs
fi

# --- 3. Service user ----------------------------------------------------------
if ! id -u "${APP_USER}" >/dev/null 2>&1; then
  log "Creating service user '${APP_USER}'..."
  useradd --system --create-home --home-dir "/home/${APP_USER}" \
    --shell /usr/sbin/nologin "${APP_USER}"
fi

# --- 4. Fetch / update source -------------------------------------------------
if [[ -d "${APP_DIR}/.git" ]]; then
  log "Updating existing checkout in ${APP_DIR}..."
  git -C "${APP_DIR}" fetch --depth 1 origin "${APP_REF}"
  git -C "${APP_DIR}" checkout -f "${APP_REF}"
  git -C "${APP_DIR}" reset --hard "origin/${APP_REF}" 2>/dev/null || \
    git -C "${APP_DIR}" reset --hard "${APP_REF}"
else
  log "Cloning ${REPO_URL} into ${APP_DIR}..."
  git clone --depth 1 --branch "${APP_REF}" "${REPO_URL}" "${APP_DIR}" 2>/dev/null || \
    git clone "${REPO_URL}" "${APP_DIR}"
fi

# --- 5. Install dependencies + build ------------------------------------------
log "Installing dependencies and building (this compiles better-sqlite3)..."
cd "${APP_DIR}"
npm ci
npm run build
log "Pruning dev dependencies to keep the container slim..."
npm prune --omit=dev

# --- 6. Configuration ---------------------------------------------------------
if [[ ! -f "${APP_DIR}/.env" ]]; then
  log "Creating ${APP_DIR}/.env from template (edit it to set OpenAI key etc.)..."
  cp "${APP_DIR}/deploy/.env.example" "${APP_DIR}/.env"
fi

# --- 7. Permissions -----------------------------------------------------------
mkdir -p "${APP_DIR}/data/backups"
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"

# --- 8. systemd service -------------------------------------------------------
log "Installing systemd unit..."
install -m 0644 "${APP_DIR}/deploy/${SERVICE_NAME}.service" \
  "/etc/systemd/system/${SERVICE_NAME}.service"
systemctl daemon-reload
systemctl enable "${SERVICE_NAME}"
systemctl restart "${SERVICE_NAME}"

# --- 9. Health check ----------------------------------------------------------
PORT="$(grep -E '^PORT=' "${APP_DIR}/.env" | cut -d= -f2 || true)"
PORT="${PORT:-8080}"
log "Waiting for the service to become healthy on port ${PORT}..."
for _ in $(seq 1 15); do
  if curl -fsS "http://127.0.0.1:${PORT}/api/health" >/dev/null 2>&1; then
    log "Service is healthy. 🎉"
    log "Open it at: http://<container-ip>:${PORT}/"
    exit 0
  fi
  sleep 1
done

err "Service did not report healthy in time. Check logs with:"
err "  journalctl -u ${SERVICE_NAME} -n 50 --no-pager"
exit 1
