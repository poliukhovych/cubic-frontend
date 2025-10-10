#!/bin/sh
set -e

# Значення за замовчуванням
: "${APP_BASE_PATH:=/cubic-frontend}"
: "${API_BASE_URL:=}"

# Генеруємо runtime конфіг (config.js) із змінних оточення
envsubst '
  $APP_BASE_PATH
  $API_BASE_URL
' < /config.template.js > "/usr/share/nginx/html${APP_BASE_PATH}/config.js"

# Запускаємо nginx
exec nginx -g 'daemon off;'
