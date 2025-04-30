import axios from 'axios';
import config from '../../config';

const BASE_URL =
    config.ENV === 'dev' ? config.API_BASE_URL_DEV : config.API_BASE_URL_PROD;

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 200000,
  // Не задаём Content-Type глобально, чтобы multipart/form-data устанавливался автоматически
  headers: {
    Accept: 'application/json, text/plain, */*',
  },
});

instance.interceptors.request.use((cfg) => {
  let user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  // Если тело запроса — FormData, удаляем Content-Type, чтобы браузер выставил multipart/form-data
  if (cfg.data instanceof FormData) {
    delete cfg.headers['Content-Type'];
  }

  if (user && user.organization && user.organization.id) {
    cfg.headers['organization-id'] = user.organization.id;
  }
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

instance.interceptors.response.use(
    response => response,
    error => {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
);

export default instance;
