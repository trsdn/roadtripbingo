# Deployment Guide — Proxmox LXC

Road Trip Bingo is a single Node.js process that serves the built front-end
(`dist/`) and a small REST API, backed by a local SQLite file. There is no
external database, cache, or message broker — which makes it a perfect fit for a
tiny, lightweight LXC container.

## Resource footprint

| Resource | Recommended | Minimum |
|----------|-------------|---------|
| vCPU     | 1           | 1       |
| RAM      | 512 MB      | 256 MB  |
| Disk     | 4 GB        | 2 GB    |
| OS       | Debian 12   | Debian/Ubuntu |

> **Why Debian, not Alpine?** The app uses the native `better-sqlite3` addon.
> It builds cleanly on Debian/Ubuntu (glibc). Alpine (musl) works but needs
> extra fiddling — not worth it for a homelab box.

## 1. Create the LXC container (on the Proxmox host)

Easiest path: a **Debian 12** template, **unprivileged** container.

```bash
# Adjust storage (local-lvm) and bridge (vmbr0) to your setup.
pct create 110 local:vztmpl/debian-12-standard_12.7-1_amd64.tar.zst \
  --hostname roadtripbingo \
  --cores 1 --memory 512 --swap 512 \
  --rootfs local-lvm:4 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --unprivileged 1 --features nesting=1 \
  --onboot 1

pct start 110
pct exec 110 -- bash -c 'apt-get update && apt-get install -y curl'
```

> `nesting=1` is not strictly required but avoids occasional issues with
> Node's native addons and `npm` in unprivileged containers.

## 2. Install the app (inside the container)

Enter the container (`pct enter 110`) and run the installer. It is **idempotent**
— re-run it any time to deploy the latest version.

```bash
curl -fsSL https://raw.githubusercontent.com/trsdn/roadtripbingo/main/deploy/setup-lxc.sh -o setup-lxc.sh
bash setup-lxc.sh
```

What the script does:

1. Installs base packages + Node.js 22 (NodeSource) if not already present
2. Creates a dedicated, unprivileged `roadtripbingo` system user
3. Clones the repo into `/opt/roadtripbingo`
4. `npm ci` → `npm run build` → `npm prune --omit=dev` (keeps it slim)
5. Creates `/opt/roadtripbingo/.env` from the template
6. Installs + enables the `roadtripbingo` systemd service
7. Waits for `GET /api/health` to return healthy

Open the app at `http://<container-ip>:8080/`.

### Configuration

Edit `/opt/roadtripbingo/.env` (see [`deploy/.env.example`](../deploy/.env.example)):

```ini
PORT=8080
NODE_ENV=production
# Optional — enables AI icon analysis. Leave empty to disable the feature.
OPENAI_API_KEY=
```

Apply changes with `systemctl restart roadtripbingo`.

## 3. Updating

```bash
pct enter 110
bash /opt/roadtripbingo/deploy/setup-lxc.sh
# or pin a release:  APP_REF=v1.2.0 bash /opt/roadtripbingo/deploy/setup-lxc.sh
```

## 4. Service management

```bash
systemctl status roadtripbingo
systemctl restart roadtripbingo
journalctl -u roadtripbingo -f          # live logs
```

## 5. Backups

All persistent state is a single SQLite file plus optional backups:

```
/opt/roadtripbingo/data/roadtripbingo.db
/opt/roadtripbingo/data/backups/
```

Two complementary strategies:

- **Container-level:** a normal Proxmox backup (`vzdump`) of CT 110 captures
  everything.
- **App-level:** `GET /api/export` returns a portable JSON backup. Example cron
  (daily at 03:00) inside the container:

  ```bash
  echo '0 3 * * * roadtripbingo curl -fsS http://127.0.0.1:8080/api/export \
    -o /opt/roadtripbingo/data/backups/auto-$(date +\%F).json' \
    > /etc/cron.d/roadtripbingo-backup
  ```

## 6. Optional: TLS / reverse proxy

For a clean hostname + HTTPS, put **Caddy** in front (in the same container or a
separate one):

```caddyfile
bingo.example.com {
    reverse_proxy 127.0.0.1:8080
}
```

Caddy fetches and renews Let's Encrypt certificates automatically.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `better-sqlite3` build fails | Ensure `build-essential` + `python3` are installed (the script does this). |
| Service won't start | `journalctl -u roadtripbingo -n 50 --no-pager` |
| Health check times out | Confirm `PORT` in `.env` matches what you curl; check firewall. |
| Port already in use | Change `PORT` in `.env`, then `systemctl restart roadtripbingo`. |
