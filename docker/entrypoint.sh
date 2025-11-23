#!/bin/sh
set -e

# Default values
: "${APP_BASE_PATH:=/}"
: "${API_BASE_URL:=}"
: "${GOOGLE_CLIENT_ID:=}"
: "${GOOGLE_REDIRECT_URI:=}"

# Generate runtime config (config.js) from environment variables
envsubst '
	$APP_BASE_PATH
	$API_BASE_URL
	$GOOGLE_CLIENT_ID
	$GOOGLE_REDIRECT_URI
' < /config.template.js > "/usr/share/nginx/html/config.js"

# Log configuration for debugging
echo "Frontend configuration:"
echo "  APP_BASE_PATH: ${APP_BASE_PATH}"
echo "  API_BASE_URL: ${API_BASE_URL}"
echo "  GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}"
echo "  GOOGLE_REDIRECT_URI: ${GOOGLE_REDIRECT_URI}"

# Start nginx
exec nginx -g 'daemon off;'