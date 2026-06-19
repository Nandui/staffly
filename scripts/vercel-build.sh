#!/usr/bin/env bash
# Production build for Vercel: apply migrations, then build.
#
# Prisma needs a DIRECT (unpooled) connection for `migrate deploy`
# (schema.prisma -> directUrl = env("DATABASE_URL_UNPOOLED")). Neon's Vercel
# integration provides DATABASE_URL_UNPOOLED automatically. If only DATABASE_URL
# is configured, derive the direct URL from it by stripping Neon's "-pooler"
# host suffix (a no-op for non-pooled / non-Neon URLs).
set -euo pipefail

if [ -z "${DATABASE_URL_UNPOOLED:-}" ] && [ -n "${DATABASE_URL:-}" ]; then
  export DATABASE_URL_UNPOOLED="${DATABASE_URL/-pooler/}"
  echo "vercel-build: DATABASE_URL_UNPOOLED not set — derived from DATABASE_URL."
fi

prisma migrate deploy
next build
