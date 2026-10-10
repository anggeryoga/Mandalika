#!/bin/bash
# Push repo Mandalika ke GitHub (anggeryoga/Mandalika)
# Cara pakai:
#   export GH_TOKEN='ghp_xxxxxxxx'   # token akun anggeryoga
#   ./push-mandalika.sh
set -e
cd "$(dirname "$0")"

if [ -z "$GH_TOKEN" ]; then
  echo "ERROR: set dulu token -> export GH_TOKEN='ghp_...'"
  exit 1
fi

git push "https://x-access-token:${GH_TOKEN}@github.com/anggeryoga/Mandalika.git" main
echo "✔ Push selesai."
