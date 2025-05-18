// src/plugins/axios.js
import axios from 'axios';
import config from '@/config';

const BASE_URL =
    config.ENV === 'dev'
        ? config.API_BASE_URL_DEV
        : config.API_BASE_URL_PROD;

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 200000,
  headers: {
    Accept: 'application/json, text/plain, */*',
  },
});

// Добавляем перехватчик запросов
instance.interceptors.request.use(cfg => {
  // Получаем сохранённого пользователя и токен
  const userJson = localStorage.getItem('user');
  const token    = localStorage.getItem('accessToken');

  // Если FormData — не портим Content-Type, чтобы браузер выставил multipart
  if (cfg.data instanceof FormData) {
    delete cfg.headers['Content-Type'];
  }

  // Заголовок авторизации
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }

  // Текущая организация — берём из localStorage
  const raw = localStorage.getItem('current_organization');
  let currentOrgId = null;

  if (raw) {
    try {
      const org = JSON.parse(raw);
      currentOrgId = org.id;
    } catch {
      currentOrgId = raw.id
      ;
    }
  }
  if (currentOrgId) {
    cfg.headers['organization-id'] = currentOrgId;
  } else if (userJson) {
    const user = JSON.parse(userJson);
    if (Array.isArray(user.organizations) && user.organizations.length) {
      cfg.headers['organization-id'] = user.organizations[0].id;
    }
  }

  return cfg;
});

// Перехватчик ошибок
instance.interceptors.response.use(
    res => res,
    err => {
      if (err.response && [401, 403].includes(err.response.status)) {
        // при необходимости логика редиректа на логин
        // localStorage.clear();
        // window.location.href = '/login';
      }
      return Promise.reject(err);
    }
);

export default instance;