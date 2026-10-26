#!/usr/bin/env bash
set -euo pipefail

echo "🔄 Changing directory ownership for $DIR_PATHS_TO_CHANGE_OWNER to $USER"
# DIR_PATHS_TO_CHANGE_OWNER is a space-separated list of paths.
sudo chown -R "$USER:$USER" $DIR_PATHS_TO_CHANGE_OWNER
echo "✅ Changed directory ownership for $DIR_PATHS_TO_CHANGE_OWNER to $USER"

echo "🔄 Installing pnpm"
corepack enable pnpm
corepack prepare pnpm@10.33.0 --activate
echo "✅ pnpm installed"

./.devcontainer/commands/common/synchronizeProject.sh
