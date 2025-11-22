# ---------- build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Set Node options for more memory
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci || npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

FROM nginx:1.27-alpine
ENV APP_BASE_PATH=/
ENV API_BASE_URL=
ENV WEB_ROOT=/usr/share/nginx/html

COPY --from=build /app/dist ${WEB_ROOT}

# ✅ підкладаємо свій nginx.conf і серверний default.conf
COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# runtime config (якщо використовуєш)
COPY ./docker/config/config.template.js /config.template.js
COPY ./docker/entrypoint.sh /entrypoint.sh
# Install envsubst and normalize line endings for entrypoint
RUN apk add --no-cache gettext && \
	# strip CRLF and potential UTF-8 BOM to avoid exec format errors
	sed -i 's/\r$//' /entrypoint.sh && \
	sed -i '1s/^\xEF\xBB\xBF//' /entrypoint.sh || true && \
	chmod +x /entrypoint.sh

EXPOSE 80
# Run via sh to avoid shebang/BOM edge cases on Windows checkouts
ENTRYPOINT ["sh", "/entrypoint.sh"]