# ---------- build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Опційно: якщо використовуєш pnpm — заміни на pnpm
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
# Vite base вже заданий у vite.config.ts
RUN npm run build

FROM nginx:1.27-alpine
ENV APP_BASE_PATH=/cubic-frontend
ENV API_BASE_URL=
ENV WEB_ROOT=/usr/share/nginx/html

COPY --from=build /app/dist ${WEB_ROOT}${APP_BASE_PATH}

# ✅ підкладаємо свій nginx.conf і серверний default.conf
COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# runtime config (якщо використовуєш)
COPY ./docker/config/config.template.js /config.template.js
COPY ./docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]