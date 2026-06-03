#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
tools_dir="$(cd "${script_dir}/../tools" && pwd)"
stacks=(traefik umami listmonk chatwoot n8n docuseal twenty)

"${script_dir}/preflight.sh"

cd "$tools_dir"
test -f .env || {
  echo "Missing ${tools_dir}/.env. Copy .env.example and fill production values." >&2
  exit 1
}

for stack in "${stacks[@]}"; do
  echo "Deploying ${stack}"
  docker compose --env-file .env -f "${stack}/compose.yml" config >/dev/null
  docker compose --env-file .env -f "${stack}/compose.yml" up -d
done

docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
