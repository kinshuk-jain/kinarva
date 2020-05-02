# node 12.16.2
FROM node:lts-buster

ENV NODE_ENV production

# setup a working directory
WORKDIR /usr/src/app

# copy package.json file
COPY package*.json ./

# npm install
RUN npm ci --only=production

# copy code to zip it in next step
COPY public public
COPY server.js ./
COPY config/prod/.env ./
COPY src src

# build the code
RUN npm run build
