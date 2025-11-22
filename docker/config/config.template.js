// Генерується на старті контейнера через envsubst
window.__APP_CONFIG__ = {
  APP_BASE_PATH: "${APP_BASE_PATH}",
  API_BASE_URL: "${API_BASE_URL}",
  GOOGLE_CLIENT_ID: "${GOOGLE_CLIENT_ID}",
  GOOGLE_REDIRECT_URI: "${GOOGLE_REDIRECT_URI}"
};
