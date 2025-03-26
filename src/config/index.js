const config = {
  ENV: import.meta.env.VITE_ENV,
  API_BASE_URL_DEV: import.meta.env.VITE_API_BASE_URL_DEV,
  API_BASE_URL_PROD: import.meta.env.VITE_API_BASE_URL_PROD,
  API_BASE_URL_IMAGE: import.meta.env.VITE_API_BASE_URL_IMAGE,
};
export default config;
