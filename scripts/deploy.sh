#!/usr/bin/env bash
# Deploy ideas.phasetransitions.ai.
#
# This site differs from its siblings (agent-assurance, agent-risk): there is
# no separate public repo and no build step. THIS repo is public and GitHub
# Pages serves main /docs directly, so a deploy is just a push of what is
# already committed. Pushing publishes; there is no staging step.
#
# What it does: preflight (clean tree, the files a share preview and a crawler
# need, no dangling local asset references), push, request a Pages build, wait
# for THAT commit to be the built one, then read the live URL back. A push does
# not reliably queue a build: on 2026-07-23 a sibling site's commit landed and
# Pages went on serving a build from two days earlier, so "pushed" is not
# "live". Reports done only when the site has served the change.
#
#   ./scripts/deploy.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE_REPO="grahamrowe82/ideas"
SITE_URL="https://$(tr -d '\n' < "$ROOT/docs/CNAME")"
cd "$ROOT"

echo "Preflight..."
if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree is dirty. A deploy publishes HEAD, so commit first:" >&2
  git status --short >&2
  exit 1
fi

# The files whose absence is invisible locally and embarrassing in public: no
# og.png means WhatsApp upscales the 32px favicon into the preview slot.
for f in index.html 404.html og.png apple-touch-icon.png favicon.svg \
         favicon-32.png robots.txt sitemap.xml CNAME; do
  [ -f "docs/$f" ] || { echo "missing docs/$f" >&2; exit 1; }
done

# Local href/src targets must resolve. Pages serves a 404 for a typo'd asset
# and nothing else complains.
MISSING=0
while read -r ref; do
  [ -z "$ref" ] && continue
  case "$ref" in http*|//*|mailto:*|\#*|data:*) continue ;; esac
  path="${ref%%[?#]*}"
  path="${path#./}"
  path="${path#/}"
  [ -z "$path" ] && continue
  if [ ! -e "docs/$path" ]; then
    echo "dangling reference: $ref" >&2
    MISSING=1
  fi
done < <(grep -ohE '(href|src)="[^"]*"' docs/*.html | sed -E 's/.*="([^"]*)"/\1/' | sort -u)
[ "$MISSING" -eq 0 ] || exit 1
echo "Preflight passed."

SHA="$(git rev-parse HEAD)"
SHORT="${SHA:0:7}"
if [ -n "$(git log --oneline origin/main..HEAD 2>/dev/null)" ]; then
  git push -q
  echo "pushed $SHORT"
else
  echo "origin already at $SHORT; verifying what is live"
fi

# Wait for Pages to publish THIS commit. Two failure modes, both observed on
# 2026-07-23, and the fix for one is the cause of the other:
#   - a push does not always queue a build (a sibling site sat on a build two
#     days stale while its new commit was live in the repo), so if nothing has
#     appeared for this commit after ~30s, ask for one;
#   - two builds of the same commit race (the push-triggered one and a
#     requested one) and the loser records a bare "Page build failed." while
#     the winner publishes normally. So success is ANY built record for this
#     commit, not the status of the most recent one.
echo "Waiting for Pages to publish $SHORT..."
BUILT="" REQUESTED="" RETRIED=""
for i in $(seq 1 40); do
  STATUSES="$(gh api "repos/$SITE_REPO/pages/builds" \
    --jq "[.[] | select(.commit == \"$SHA\") | .status] | join(\" \")")"
  case " $STATUSES " in
    *" built "*) BUILT=yes; break ;;
    *" building "*|*" queued "*) ;;                    # in flight, keep waiting
    "  ")                                              # nothing for this commit
      if [ -z "$REQUESTED" ] && [ "$i" -ge 6 ]; then
        echo "  no build queued for $SHORT; requesting one"
        gh api -X POST "repos/$SITE_REPO/pages/builds" --silent
        REQUESTED=yes
      fi ;;
    *)                                                 # only failures so far
      if [ -z "$RETRIED" ]; then
        echo "  build of $SHORT failed; retrying once"
        gh api -X POST "repos/$SITE_REPO/pages/builds" --silent
        RETRIED=yes
      else
        echo "Pages failed to build $SHORT twice." >&2
        exit 1
      fi ;;
  esac
  sleep 5
done
if [ -z "$BUILT" ]; then
  echo "Pages did not publish $SHORT in time; check $SITE_URL" >&2
  exit 1
fi

# Read it back the way a stranger would, including the share card, since that
# is the asset nobody notices is broken.
FAIL=0
for p in "" og.png robots.txt sitemap.xml; do
  CODE="$(curl -s -o /dev/null -w '%{http_code}' "$SITE_URL/$p")"
  [ "$CODE" = "200" ] || { echo "$SITE_URL/$p returned $CODE" >&2; FAIL=1; }
done
[ "$FAIL" -eq 0 ] || exit 1
echo "live: $SITE_URL/ ($SHORT)"
