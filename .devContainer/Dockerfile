ARG NODE_VERSION
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${NODE_VERSION}

# Update APT
RUN apt update -y

# Install Python
RUN apt install -y \
    python3-venv \
    ibpython3.7-dev \ 
    python3-pip

# Install Global NPM Dependencies
RUN npm install -g \
    npm@8.5.1
