// src/store/queueStore.js

import { defineStore } from 'pinia';
import { EventSourcePolyfill } from 'event-source-polyfill';
import axios from '../plugins/axios/index';
import config from '@/config';

const BASE_URL =
    config.ENV === 'dev'
        ? config.API_BASE_URL_DEV    // e.g. "http://localhost:3000/"
        : config.API_BASE_URL_PROD;  // e.g. "https://api.yoursite.com/"

export const useQueueStore = defineStore('queue', {
    state: () => ({
        queue: [],             // текущая очередь
        eventSource: null,     // SSE для очереди
        notifSource: null,     // SSE для уведомлений
        notifications: [],     // пришедшие вызовы {called}
        loading: false         // индикатор вызова
    }),

    actions: {
        /**
         * Подписаться на live-очередь через SSE.
         * @param {number|null} practitionerRoleId
         * @param {string} date — YYYY-MM-DD
         */
        subscribeQueue(practitionerRoleId, date) {
            this.unsubscribeQueue();

            const token = localStorage.getItem('token');
            const orgId = JSON.parse(localStorage.getItem('user'))?.organization?.id;
            const params = new URLSearchParams({ date }).toString();
            const url = `${BASE_URL}appointments/queue/stream?${params}`;

            const es = new EventSourcePolyfill(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Organization-ID': orgId
                },
                heartbeatTimeout: 60000
            });

            es.onmessage = ({ data }) => {
                try {
                    const payload = JSON.parse(data);
                    if (payload.queue) {
                        this.queue = payload.queue;
                    } else if (Array.isArray(payload.queues)) {
                        const entry = payload.queues.find(
                            e => e.practitioner_role_id === practitionerRoleId
                        );
                        this.queue = entry ? entry.queue : [];
                    }
                } catch (err) {
                    console.error('SSE parse error (queue):', err);
                }
            };

            es.onerror = err => {
                console.error('SSE connection error (queue):', err);
                es.close();
            };

            this.eventSource = es;
        },

        /**
         * Отключить SSE очереди.
         */
        unsubscribeQueue() {
            if (this.eventSource) {
                this.eventSource.close();
                this.eventSource = null;
            }
        },

        /**
         * Подписаться на уведомления вызова талона.
         */
        subscribeNotifications() {
            this.unsubscribeNotifications();

            const token = localStorage.getItem('token');
            const orgId = JSON.parse(localStorage.getItem('user'))?.organization?.id;
            const url = `${BASE_URL}appointments/notifications/stream`;

            const es = new EventSourcePolyfill(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Organization-ID': orgId
                },
                heartbeatTimeout: 60000
            });

            // слушаем пользовательский event "notification"
            es.addEventListener('notification', evt => {
                try {
                    const { called } = JSON.parse(evt.data);
                    this.notifications.push(called);
                } catch (err) {
                    console.error('SSE parse error (notif):', err);
                }
            });

            es.onerror = err => {
                console.error('SSE connection error (notif):', err);
                es.close();
            };

            this.notifSource = es;
        },

        /**
         * Отключить SSE уведомлений.
         */
        unsubscribeNotifications() {
            if (this.notifSource) {
                this.notifSource.close();
                this.notifSource = null;
            }
        },

        /**
         * Автоматически вызвать следующий талон (старый метод).
         */
        async callNext(practitionerRoleId, date) {
            this.loading = true;
            try {
                return await axios.post('appointments/queue/call', {
                    practitioner_role_id: practitionerRoleId,
                    date
                });
            } finally {
                this.loading = false;
            }
        },

        /**
         * Вызвать конкретный талон по ID (статус НЕ меняется в БД).
         * @param {number} appointmentId
         * @return {object} called
         */
        async callById(appointmentId) {
            this.loading = true;
            try {
                const res = await axios.post(`appointments/queue/call/${appointmentId}`);
                return res.data.called;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Одноразово получить очередь по REST (без SSE).
         */
        async fetchQueue(practitionerRoleId, date) {
            const params = { date };
            if (practitionerRoleId != null) {
                params.practitioner_role_id = practitionerRoleId;
            }
            const res = await axios.get('appointments/queue', { params });

            if (res.data.queue) {
                this.queue = res.data.queue;
            } else if (Array.isArray(res.data.queues)) {
                const entry = res.data.queues.find(
                    e => e.practitioner_role_id === practitionerRoleId
                );
                this.queue = entry ? entry.queue : [];
            }
            return this.queue;
        }
    },

    getters: {
        /** Первый талон в очереди или null */
        current: state => (state.queue.length > 0 ? state.queue[0] : null),
        /** Все остальные талоны */
        upcoming: state => state.queue.slice(1)
    }
});