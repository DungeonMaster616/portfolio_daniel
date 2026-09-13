FROM node:26.7.0-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_GITHUB_URL
ARG VITE_CONTACT_URL
RUN npm run build
FROM nginx:1.28.0-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
