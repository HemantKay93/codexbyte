FROM node:20-slim AS base

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN npm install
RUN npm run build -w @byteevolvr/backend

FROM base
COPY --from=build /usr/src/app /usr/src/app
WORKDIR /usr/src/app/backend
EXPOSE 8080
CMD [ "node", "dist/server.js" ]
