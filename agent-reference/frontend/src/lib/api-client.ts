import Axios, { InternalAxiosRequestConfig } from 'axios';

import { useNotifications } from '@/components/ui/notifications';
import { env } from '@/config/env';
import { paths } from '@/config/paths';

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
	if (config.headers) {
		config.headers.Accept = 'application/json';
	}

	config.withCredentials = true;
	return config;
}

export const api = Axios.create({
	baseURL: env.API_URL,
});

api.interceptors.request.use(authRequestInterceptor);
api.interceptors.response.use(
	(response) => {
		return response.data;
	},
	(error) => {
		if (error.response?.status === 401) {
			const isAuthPage = window.location.pathname.startsWith('/auth');
			if (!isAuthPage) {
				window.location.href = paths.auth.login.getHref(
					window.location.pathname,
				);
			}
			return Promise.reject(error);
		}

		const message = error.response?.data?.message || error.message;
		useNotifications.getState().addNotification({
			type: 'error',
			title: 'Error',
			message,
		});

		return Promise.reject(error);
	},
);
