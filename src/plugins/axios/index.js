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
  const token = localStorage.getItem('token');

  config.headers = {
    ...config.headers,
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export default instance;