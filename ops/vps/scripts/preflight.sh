#!/usr/bin/env bash
set -euo pipefail

required_commands=(docker)

for command_name in "${required_commands[@]}"; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Missing required command: $command_name" >&2
    exit 1
  fi
done

docker compose version >/dev/null

if ! docker network inspect web >/dev/null 2>&1; then
  echo "Creating external Docker network: web"
  docker network create web
fi

echo "Preflight passed"
