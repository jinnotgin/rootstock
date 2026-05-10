import { describe, expect, it, vi } from 'vitest';

import { makeApiServices } from '../api-services';

const mocks = vi.hoisted(() => ({
	apiGet: vi.fn(),
}));

vi.mock('@/lib/api-client', () => ({
	api: {
		get: mocks.apiGet,
	},
}));

describe('makeApiServices', () => {
	it('unwraps the current user response data for the auth port', async () => {
		const user = {
			id: 'user-1',
			createdAt: 1715299200000,
			firstName: 'Ada',
			lastName: 'Lovelace',
			email: 'ada@example.com',
			role: 'ADMIN',
			teamId: 'team-1',
			bio: '',
		};
		mocks.apiGet.mockResolvedValueOnce({ data: user });

		await expect(makeApiServices().auth.getCurrentUser()).resolves.toEqual(
			user,
		);
	});
});
