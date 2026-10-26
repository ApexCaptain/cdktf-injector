#!/usr/bin/env bash
set -euo pipefail

echo "🔄 Starting synchronization"

if [ "${ENABLE_AUTO_SYNC:-true}" = false ]; then
    echo "⏩ Auto sync skipped"
    exit 0
fi

echo "🔄 Installing Global Packages"
if ! command -v claude >/dev/null 2>&1; then
    npm install -g @anthropic-ai/claude-code
else
    echo "⏩ claude-code already installed"
fi
echo "✅ Installed Global Packages"

echo "🔄 Removing yarn"
# 이미지의 corepack이 만든 yarn shim을 지운다. pnpm 전용 레포에서 yarn install로 yarn.lock이 다시 생기는 것을 막는다
corepack disable yarn
rm -rf "$HOME/.yarn" "$HOME/.yarnrc" "$HOME/.cache/yarn" "$HOME/.cache/node/corepack/v1/yarn"
echo "✅ Removed yarn"

echo "🔄 Installing dependencies"
pnpm i --frozen-lockfile
echo "✅ Installed dependencies"

echo "🔄 Initializing Projen"
pnpm projen
echo "✅ Initialized Projen"

echo "🔄 Installing Husky"
pnpm exec husky
echo "✅ Installed Husky"

echo "✅ Synchronization completed"
