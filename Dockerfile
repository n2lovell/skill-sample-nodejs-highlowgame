FROM node:8
MAINTAINER Nicholas Lovell


# NPM_CONFIG_PREFIX: See below
# PATH: Required for ask cli location
ENV TZ="GMT" \
  NPM_CONFIG_PREFIX=/home/node/.npm-global \
  PATH="${PATH}:/home/node/.npm-global/bin/:/home/node/.local/bin/"

# Required pre-reqs for ask cli
RUN apt-get update
RUN apt-get install -y \
  python \
  python-dev \
  make \
  bash \
  python-pip

# See https://github.com/nodejs/docker-node/issues/603
# ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
WORKDIR /app
USER node

# /home/node/.ask: For ask CLI configuration file
# /home/node/.ask: Folder to map to for app development
RUN npm install -g ask-cli && \
  mkdir /home/node/.ask && \
  mkdir /home/node/.aws && \
  mkdir /home/node/app && \
  pip install awscli --upgrade --user

# Volumes:
# /home/node/.ask: This is the location of the ask config folder
# /home/node/app: Your development folder
VOLUME ["/home/node/.ask", "/home/node/.aws", "/home/node/app"]