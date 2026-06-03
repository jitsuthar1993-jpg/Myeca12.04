#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
edge_dir="$(cd "${script_dir}/../edge" && pwd)"

"${script_dir}/preflight.sh"

cd "$edge_dir"
test -f .env || {
  echo "Missing ${edge_dir}/.env. Copy .env.example and fill production values." >&2
  exit 1
}

docker compose --env-file .env -f compose.yml config >/dev/null
docker compose --env-file .env -f compose.yml up -d --build
docker compose --env-file .env -f compose.yml ps
