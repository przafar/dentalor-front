import axios from 'axios';
import config from '../../config';

const BASE_URL =
    config.ENV === 'dev' ? config.API_BASE_URL_DEV : config.API_BASE_URL_PROD;

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 200000,
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use((config) => {
  let user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  config.headers = {
    ...config.headers,
  };
  console.log(user, "USEr");
  if (user) {
    config.headers['organization-id'] = user?.organization?.id;
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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