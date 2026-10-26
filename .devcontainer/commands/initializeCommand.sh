#!/usr/bin/env bash
set -euo pipefail

# DevContainer Arguments
localWorkspaceFolder=$1
containerWorkspaceFolder=$2
localWorkspaceFolderBasename=$3
containerWorkspaceFolderBasename=$4
username=$5

MERGED_ENV_FILE_PATH=.devcontainer/.env
umask 077

# System Arguments (depend on workstation settings)
HOST_CLAUDE_DIR_PATH=$HOME/.claude
HOST_CLAUDE_JSON_FILE_PATH=$HOME/.claude.json

# Create docker-compose.dev.yml arg
cat > $MERGED_ENV_FILE_PATH <<EOL
# Original DevContainer Arguments
localWorkspaceFolder=$localWorkspaceFolder
containerWorkspaceFolder=$containerWorkspaceFolder
localWorkspaceFolderBasename=$localWorkspaceFolderBasename
containerWorkspaceFolderBasename=$containerWorkspaceFolderBasename 
username=$username

# Corepack Arguments
COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# Shared Volume Arguments
## Pnpm Store Directory Path
CONTAINER_PNPM_STORE_DIR_PATH=${containerWorkspaceFolder}/.pnpm-store

# Claude Arguments
HOST_CLAUDE_DIR_PATH=$HOST_CLAUDE_DIR_PATH
CONTAINER_CLAUDE_DIR_PATH=/home/$username/.claude
HOST_CLAUDE_JSON_FILE_PATH=$HOST_CLAUDE_JSON_FILE_PATH
CONTAINER_CLAUDE_JSON_FILE_PATH=/home/$username/.claude.json

# GitHub Token
GH_TOKEN=${GH_TOKEN:-}
GITHUB_TOKEN=${GITHUB_TOKEN:-}

EOL
chmod 600 "$MERGED_ENV_FILE_PATH"

# Make all derived sh files executable
chmod +x ./.devcontainer/commands/common/*.sh

# Initialize Claude JSON File If Not Exists
if [ ! -f "$HOST_CLAUDE_JSON_FILE_PATH" ]; then
    echo "{}" > "$HOST_CLAUDE_JSON_FILE_PATH"
fi