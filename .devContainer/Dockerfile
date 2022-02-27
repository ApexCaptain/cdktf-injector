ARG NODE_VERSION
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${NODE_VERSION}

# Update APT
RUN apt update -y

# Install Global NPM Dependencies
RUN npm install -g \
    npm@8.5.1

# Install Java
RUN apt install -y \
    maven

# Install Python
RUN apt install -y \
    python3-venv \
    ibpython3.7-dev \ 
    python3-pip


