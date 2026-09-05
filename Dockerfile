# Build stage
FROM node:24-bookworm-slim@sha256:6642ef280aebc09c4541bee0b15c9f89f0f3f3c247ddee79ae1d37eddfdcbbaa AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .

ARG VITE_DATABASE_API
ARG VITE_YFINANCE_API
ARG VITE_SCRAPER_API

RUN npm test && npm run lint && npm run build

# Production stage
FROM nginx:1.31.5-alpine@sha256:72ba65eb42c10344912a84ff42408db7d34f2feb642204570ab8fc5ffd29f1d3

ARG SOURCE_COMMIT
RUN case "$SOURCE_COMMIT" in *[!0-9a-f]*|'') exit 1 ;; esac \
    && test "${#SOURCE_COMMIT}" -eq 40
LABEL org.opencontainers.image.source="https://github.com/lward27/finance-frontend" \
      org.opencontainers.image.revision="${SOURCE_COMMIT}"

COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx configuration for SPA routing
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
