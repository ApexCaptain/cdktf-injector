ARG NODE_VERSION
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${NODE_VERSION}
ARG TERRAFORM_VERSION
ARG NPM_VERSION

# Install Global NPM Dependencies
RUN npm install -g \
    npm@${NPM_VERSION}

# Install APT Deps
RUN apt update -y \
    && apt install -y \
        yarn

# Install Terraform
RUN wget https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip && \
    unzip ./terraform_${TERRAFORM_VERSION}_linux_amd64.zip -d /usr/local/bin/ && \
    rm terraform_${TERRAFORM_VERSION}_linux_amd64.zip
