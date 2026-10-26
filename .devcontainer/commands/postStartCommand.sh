#!/usr/bin/env bash
set -euo pipefail

echo "🔄 Setup GitHub"
gh auth setup-git

echo "🔄 Pull latest changes"
git pull --ff-only

./.devcontainer/commands/common/synchronizeProject.sh
