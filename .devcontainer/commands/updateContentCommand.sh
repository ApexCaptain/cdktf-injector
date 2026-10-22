#!/usr/bin/env bash

echo "🔄 Changing directory ownership for $DIR_PATHS_TO_CHANGE_OWNER to $USER"
sudo chown -R $USER:$USER $DIR_PATHS_TO_CHANGE_OWNER
echo "✅ Changed directory ownership for $DIR_PATHS_TO_CHANGE_OWNER to $USER"

install_pnpm() {
    echo "🔄 Installing pnpm"
    corepack enable pnpm
    corepack prepare pnpm@latest --activate
    echo "✅ pnpm installed"
}

export -f install_pnpm   
parallel --jobs 3 ::: install_pnpm   

./.devcontainer/commands/common/synchronizeProject.sh