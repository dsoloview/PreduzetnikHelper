#!/bin/sh
# Daily PostgreSQL backups for docker-compose.prod.yml: a custom-format dump right away and then every
# BACKUP_INTERVAL_SECONDS, keeping BACKUP_KEEP_DAYS days. Connection comes from the standard PG* variables.
set -eu

BACKUP_DIR=${BACKUP_DIR:-/backups}
BACKUP_KEEP_DAYS=${BACKUP_KEEP_DAYS:-14}
BACKUP_INTERVAL_SECONDS=${BACKUP_INTERVAL_SECONDS:-86400}

backup_once() {
  timestamp=$(date -u +%Y%m%dT%H%M%SZ)
  target="$BACKUP_DIR/${PGDATABASE}_${timestamp}.dump"
  # Write to a temp name first, so a failed dump never looks like a valid backup
  if pg_dump --format=custom --no-owner --file="$target.partial"; then
    mv "$target.partial" "$target"
    echo "backup: wrote $target ($(du -h "$target" | cut -f1))"
  else
    rm -f "$target.partial"
    echo "backup: pg_dump failed" >&2
    return 1
  fi
  find "$BACKUP_DIR" -name "${PGDATABASE}_*.dump" -type f -mtime +"$BACKUP_KEEP_DAYS" -print -delete \
    | sed 's/^/backup: removed old /'
}

mkdir -p "$BACKUP_DIR"
if [ "${1:-}" = "--once" ]; then
  backup_once
  exit $?
fi

while true; do
  backup_once || true
  sleep "$BACKUP_INTERVAL_SECONDS"
done
