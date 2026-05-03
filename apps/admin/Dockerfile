FROM node:20-slim AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN npm install
RUN npm run build -w @byteevolvr/admin

FROM nginx:stable-alpine
COPY --from=build /usr/src/app/apps/admin/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
