import { AuthResponse, Comment, Discussion, Team, User } from '@/domain/types';
import { AppServices } from '@/services/app-services-provider';

type TestServiceOverrides = Partial<AppServices>;

const now = 1715299200000;

const testUser: User = {
	id: 'test-user-1',
	createdAt: now,
	firstName: 'Test',
	lastName: 'User',
	email: 'test@example.com',
	role: 'ADMIN',
	teamId: 'test-team-1',
	bio: '',
};

const testTeam: Team = {
	id: 'test-team-1',
	createdAt: now,
	name: 'Test Team',
	description: '',
};

const testDiscussion: Discussion = {
	id: 'test-discussion-1',
	createdAt: now,
	title: 'Test discussion',
	body: 'A discussion supplied by the test adapter.',
	teamId: testTeam.id,
	author: testUser,
};

const testComment: Comment = {
	id: 'test-comment-1',
	createdAt: now,
	body: 'A comment supplied by the test adapter.',
	discussionId: testDiscussion.id,
	author: testUser,
};

const authResponse: AuthResponse = {
	jwt: 'test-token',
	user: testUser,
};

export const makeTestServices = (
	overrides: TestServiceOverrides = {},
): AppServices => ({
	auth: {
		getCurrentUser: async () => testUser,
		login: async () => authResponse,
		register: async () => authResponse,
		logout: async () => {},
	},
	teams: {
		listTeams: async () => ({ data: [testTeam] }),
	},
	users: {
		listUsers: async () => ({ data: [testUser] }),
		updateProfile: async (input) => ({ ...testUser, ...input }),
		deleteUser: async () => testUser,
	},
	discussions: {
		listDiscussions: async () => ({
			data: [testDiscussion],
			meta: { page: 1, total: 1, totalPages: 1 },
		}),
		getDiscussion: async () => ({ data: testDiscussion }),
		createDiscussion: async (input) => ({ ...testDiscussion, ...input }),
		updateDiscussion: async (_discussionId, input) => ({
			...testDiscussion,
			...input,
		}),
		deleteDiscussion: async () => testDiscussion,
	},
	comments: {
		listComments: async () => ({
			data: [testComment],
			meta: { page: 1, total: 1, totalPages: 1 },
		}),
		createComment: async (input) => ({
			...testComment,
			...input,
		}),
		deleteComment: async () => testComment,
	},
	flags: {
		isEnabled: () => false,
	},
	monitor: {
		info: () => {},
		error: () => {},
	},
	...overrides,
});
