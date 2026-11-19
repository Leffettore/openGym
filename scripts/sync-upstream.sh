#!/bin/sh
# Pulls new commits from the original repository (DuarteSantos8/openGym) into this checkout
# and rebuilds the stack when something changed. Meant for cron, e.g. every night at 4:
#   0 4 * * * /path/to/openGym/scripts/sync-upstream.sh >> /path/to/openGym/sync-upstream.log 2>&1
# A merge conflict aborts the merge and exits non-zero; nothing is rebuilt.
set -eu

UPSTREAM_URL=${UPSTREAM_URL:-https://github.com/DuarteSantos8/openGym.git}
BRANCH=${BRANCH:-main}

cd "$(dirname "$0")/.."
exec 9>.git/sync-upstream.lock
flock -n 9 || { echo "sync-upstream: already running"; exit 0; }

git remote get-url upstream >/dev/null 2>&1 || git remote add upstream "$UPSTREAM_URL"
git fetch --quiet upstream "$BRANCH"

before=$(git rev-parse HEAD)
git merge --no-edit "upstream/$BRANCH" || { git merge --abort; echo "sync-upstream: conflict, merge aborted"; exit 1; }
[ "$(git rev-parse HEAD)" = "$before" ] && { echo "$(date -Is) up to date"; exit 0; }

echo "$(date -Is) updated $before -> $(git rev-parse HEAD), rebuilding"
docker compose up -d --build
