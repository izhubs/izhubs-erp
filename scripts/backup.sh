#!/usr/bin/env bash
# =============================================================
# izhubs ERP — Database Backup Script (Phase 1.3)
# Usage: npm run backup
# Creates: backups/izhubs-YYYYMMDD-HHmm.sql.gz
# =============================================================
set -euo pipefail

BACKUP_DIR="$(dirname "$0")/../backups"
TIMESTAMP=$(date +"%Y%m%d-%H%M")
FILENAME="izhubs-${TIMESTAMP}.sql.gz"
FILEPATH="${BACKUP_DIR}/${FILENAME}"

# Load .env if it exists (for DATABASE_URL)
if [ -f "$(dirname "$0")/../.env.local" ]; then
  export $(grep -v '^#' "$(dirname "$0")/../.env.local" | xargs)
fi

DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/izhubs_erp}"

mkdir -p "$BACKUP_DIR"

echo "🗄️  Backing up izhubs ERP database..."
pg_dump "$DB_URL" | gzip > "$FILEPATH"

SIZE=$(du -sh "$FILEPATH" | cut -f1)
echo "✅ Backup saved: ${FILEPATH} (${SIZE})"

# Keep only last 30 backups
BACKUP_COUNT=$(ls "$BACKUP_DIR"/*.sql.gz 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt 30 ]; then
  ls -t "$BACKUP_DIR"/*.sql.gz | tail -n +31 | xargs rm -f
  echo "🧹 Pruned old backups (kept 30 most recent)"
fi
