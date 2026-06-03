#!/usr/bin/env bash
set -euo pipefail

backup_root="${BACKUP_ROOT:-/opt/myeca-backups}"
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
target="${backup_root}/${stamp}"

mkdir -p "$target"

docker ps --format '{{.Names}}' > "${target}/containers.txt"
docker volume ls --format '{{.Name}}' > "${target}/volumes.txt"

for volume in $(docker volume ls --format '{{.Name}}' | grep -E 'myeca|umami|listmonk|chatwoot|n8n|docuseal|twenty' || true); do
  docker run --rm \
    -v "${volume}:/volume:ro" \
    -v "${target}:/backup" \
    alpine:3.20 \
    sh -c "tar czf /backup/${volume}.tar.gz -C /volume ."
done

find /opt -path '*myeca*' -name '.env' -type f -print0 2>/dev/null \
  | xargs -0 -r tar czf "${target}/env-files.tar.gz"

echo "Backup written to ${target}"
