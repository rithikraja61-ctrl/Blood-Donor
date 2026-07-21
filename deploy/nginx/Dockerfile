FROM node:20-alpine AS frontend-build

WORKDIR /app

ARG VITE_API_BASE_URL=/api
ARG VITE_GOOGLE_MAPS_API_KEY=
ARG VITE_GOOGLE_GEOCODING_API_KEY=
ARG VITE_GOOGLE_PLACES_API_KEY=

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
ENV VITE_GOOGLE_GEOCODING_API_KEY=$VITE_GOOGLE_GEOCODING_API_KEY
ENV VITE_GOOGLE_PLACES_API_KEY=$VITE_GOOGLE_PLACES_API_KEY

COPY Blood-Donor-FrontEnd/package.json Blood-Donor-FrontEnd/package-lock.json ./
RUN npm ci

COPY Blood-Donor-FrontEnd/ ./
RUN npm run build

FROM nginx:1.27-alpine

RUN apk add --no-cache openssl gettext

COPY deploy/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY deploy/nginx/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

COPY --from=frontend-build /app/dist /usr/share/nginx/html

ENV SERVER_NAME=localhost
ENV BACKEND_HOST=http://app:8080

EXPOSE 80 443

ENTRYPOINT ["/docker-entrypoint.sh"]
