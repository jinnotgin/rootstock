import { HttpResponse, http } from 'msw';

import { networkDelay } from '../utils';

import { authHandlers } from './auth';
import { commentsHandlers } from './comments';
import { discussionsHandlers } from './discussions';
import { teamsHandlers } from './teams';
import { usersHandlers } from './users';

import { env } from '@/config/env';

export const handlers = [
	...authHandlers,
	...commentsHandlers,
	...discussionsHandlers,
	...teamsHandlers,
	...usersHandlers,
	http.get(`${env.API_URL}/healthcheck`, async () => {
		await networkDelay();
		return HttpResponse.json({ ok: true });
	}),
];
