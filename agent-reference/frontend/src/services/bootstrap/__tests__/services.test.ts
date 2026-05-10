import { describe, expect, it, vi } from 'vitest';

import { AppServices } from '@/services/app-services-provider';

import { makeServices } from '../services';

const mocks = vi.hoisted(() => {
	const serviceSet = (label: string) =>
		({
			auth: { label: `${label}-auth` },
			teams: { label: `${label}-teams` },
			users: { label: `${label}-users` },
			discussions: { label: `${label}-discussions` },
			comments: { label: `${label}-comments` },
			flags: { label: `${label}-flags` },
			monitor: { label: `${label}-monitor` },
		}) as unknown as AppServices;

	return {
		apiServices: serviceSet('api'),
		localServices: serviceSet('local'),
	};
});

vi.mock('@/adapters/http/api-services', () => ({
	makeApiServices: () => mocks.apiServices,
}));

vi.mock('@/adapters/local/local-services', () => ({
	makeLocalServices: () => mocks.localServices,
}));

describe('makeServices', () => {
	it('selects auth and data adapters independently from runtime mode', () => {
		const services = makeServices({
			runtimeMode: 'dev',
			authCapability: 'api',
			dataCapability: 'local',
			localScenario: 'discussion-with-comments',
		});

		expect(services.auth).toBe(mocks.apiServices.auth);
		expect(services.teams).toBe(mocks.localServices.teams);
		expect(services.users).toBe(mocks.localServices.users);
		expect(services.discussions).toBe(mocks.localServices.discussions);
		expect(services.comments).toBe(mocks.localServices.comments);
	});
});
