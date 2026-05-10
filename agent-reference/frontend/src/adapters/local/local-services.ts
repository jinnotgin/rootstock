import { AuthResponse, Comment, Discussion, Team, User } from '@/domain/types';
import { AppServices } from '@/services/app-services-provider';

import { LocalDatabase, createId } from './local-database';
import { LocalScenario, localScenarioData } from './local-scenarios';

const page = <T>(data: T[], currentPage = 1) => {
	const pageSize = 10;
	const total = data.length;
	return {
		data: data.slice((currentPage - 1) * pageSize, currentPage * pageSize),
		meta: {
			page: currentPage,
			total,
			totalPages: Math.ceil(total / pageSize),
		},
	};
};

const now = () => Date.now();

const currentUser = async (db: LocalDatabase) => {
	const sessions = await db.getAll<{ userId: string }>('session');
	const session = sessions[0];
	if (!session) throw new Error('Unauthorized');
	const user = await db.get<User>('users', session.userId);
	if (!user) throw new Error('Unauthorized');
	return user;
};

const requireAdmin = async (db: LocalDatabase) => {
	const user = await currentUser(db);
	if (user.role !== 'ADMIN') throw new Error('Forbidden');
	return user;
};

class LocalAuthProvider {
	constructor(private readonly db: LocalDatabase) {}

	async getCurrentUser() {
		const sessions = await this.db.getAll<{ userId: string }>('session');
		const session = sessions[0];
		if (!session) return null;
		return (await this.db.get<User>('users', session.userId)) ?? null;
	}

	async login(input: {
		email: string;
		password: string;
	}): Promise<AuthResponse> {
		const users = await this.db.getAll<User & { password?: string }>('users');
		const user = users.find(
			(candidate) =>
				candidate.email === input.email &&
				candidate.password === input.password,
		);
		if (!user) throw new Error('Invalid username or password');
		await this.db.clear('session');
		await this.db.put('session', { userId: user.id });
		return { jwt: btoa(JSON.stringify({ id: user.id })), user };
	}

	async register(input: {
		email: string;
		firstName: string;
		lastName: string;
		password: string;
		teamId?: string | null;
		teamName?: string | null;
	}): Promise<AuthResponse> {
		const users = await this.db.getAll<User & { password?: string }>('users');
		if (users.some((user) => user.email === input.email)) {
			throw new Error('The user already exists');
		}

		let teamId = input.teamId ?? '';
		let role: User['role'] = 'USER';
		if (!teamId) {
			role = 'ADMIN';
			teamId = createId();
			await this.db.put('teams', {
				id: teamId,
				createdAt: now(),
				name: input.teamName || `${input.firstName} Team`,
				description: '',
			});
		}

		const user: User & { password?: string } = {
			id: createId(),
			createdAt: now(),
			firstName: input.firstName,
			lastName: input.lastName,
			email: input.email,
			role,
			teamId,
			bio: '',
			password: input.password,
		};
		await this.db.put('users', user);
		await this.db.clear('session');
		await this.db.put('session', { userId: user.id });
		return { jwt: btoa(JSON.stringify({ id: user.id })), user };
	}

	async logout() {
		await this.db.clear('session');
	}
}

class LocalTeamStore {
	constructor(private readonly db: LocalDatabase) {}

	async listTeams() {
		return { data: await this.db.getAll<Team>('teams') };
	}
}

class LocalUserStore {
	constructor(private readonly db: LocalDatabase) {}

	async listUsers() {
		return { data: await this.db.getAll<User>('users') };
	}

	async updateProfile(input: {
		email: string;
		firstName: string;
		lastName: string;
		bio: string;
	}) {
		const user = await currentUser(this.db);
		const updated = { ...user, ...input };
		await this.db.put('users', updated);
		return updated;
	}

	async deleteUser(userId: string) {
		await requireAdmin(this.db);
		const user = await this.db.get<User>('users', userId);
		if (!user) throw new Error('Not found');
		await this.db.delete('users', userId);
		return user;
	}
}

class LocalDiscussionStore {
	constructor(private readonly db: LocalDatabase) {}

	async listDiscussions(currentPage = 1) {
		const discussions = await this.withAuthors();
		return page(discussions, currentPage);
	}

	async getDiscussion(discussionId: string) {
		const discussion = await this.db.get<Discussion & { authorId?: string }>(
			'discussions',
			discussionId,
		);
		if (!discussion) throw new Error('Discussion not found');
		const author = discussion.authorId
			? await this.db.get<User>('users', discussion.authorId)
			: undefined;
		return { data: { ...discussion, author: author ?? discussion.author } };
	}

	async createDiscussion(input: { title: string; body: string }) {
		const user = await requireAdmin(this.db);
		const discussion = {
			id: createId(),
			createdAt: now(),
			title: input.title,
			body: input.body,
			teamId: user.teamId,
			authorId: user.id,
			author: user,
		};
		await this.db.put('discussions', discussion);
		return discussion;
	}

	async updateDiscussion(
		discussionId: string,
		input: { title: string; body: string },
	) {
		await requireAdmin(this.db);
		const discussion = await this.db.get<Discussion & { authorId?: string }>(
			'discussions',
			discussionId,
		);
		if (!discussion) throw new Error('Discussion not found');
		const updated = { ...discussion, ...input };
		await this.db.put('discussions', updated);
		const author = updated.authorId
			? await this.db.get<User>('users', updated.authorId)
			: undefined;
		return { ...updated, author: author ?? updated.author };
	}

	async deleteDiscussion(discussionId: string) {
		await requireAdmin(this.db);
		const result = await this.getDiscussion(discussionId);
		await this.db.delete('discussions', discussionId);
		return result.data;
	}

	private async withAuthors() {
		const users = await this.db.getAll<User>('users');
		const discussions = await this.db.getAll<
			Discussion & { authorId?: string }
		>('discussions');
		return discussions.map((discussion) => ({
			...discussion,
			author:
				users.find((user) => user.id === discussion.authorId) ??
				discussion.author,
		}));
	}
}

class LocalCommentStore {
	constructor(private readonly db: LocalDatabase) {}

	async listComments({
		discussionId,
		page: currentPage = 1,
	}: {
		discussionId: string;
		page?: number;
	}) {
		const rawComments = await this.db.getAllByIndex<
			Comment & { authorId?: string }
		>('comments', 'by-discussionId', discussionId);
		const users = await this.db.getAll<User>('users');
		const comments = rawComments.map((comment) => ({
			...comment,
			author:
				users.find((user) => user.id === comment.authorId) ?? comment.author,
		}));
		return page(comments, currentPage);
	}

	async createComment(input: { discussionId: string; body: string }) {
		const user = await currentUser(this.db);
		const comment = {
			id: createId(),
			createdAt: now(),
			body: input.body,
			discussionId: input.discussionId,
			authorId: user.id,
			author: user,
		};
		await this.db.put('comments', comment);
		return comment;
	}

	async deleteComment(commentId: string) {
		const user = await currentUser(this.db);
		const comment = await this.db.get<Comment & { authorId?: string }>(
			'comments',
			commentId,
		);
		if (!comment) throw new Error('Not found');
		const authorId = comment.authorId ?? comment.author?.id;
		if (user.role !== 'ADMIN' && authorId !== user.id) {
			throw new Error('Not found');
		}
		await this.db.delete('comments', commentId);
		return comment;
	}
}

class InMemoryFlagProvider {
	isEnabled() {
		return false;
	}
}

class ConsoleMonitor {
	info(message: string, context?: Record<string, unknown>) {
		console.info(message, context ?? {});
	}

	error(error: unknown, context?: Record<string, unknown>) {
		console.error(error, context ?? {});
	}
}

export const makeLocalServices = ({
	scenario = 'empty',
}: {
	scenario?: LocalScenario;
} = {}): AppServices => {
	const db = new LocalDatabase(localScenarioData(scenario));
	return {
		auth: new LocalAuthProvider(db),
		teams: new LocalTeamStore(db),
		users: new LocalUserStore(db),
		discussions: new LocalDiscussionStore(db),
		comments: new LocalCommentStore(db),
		flags: new InMemoryFlagProvider(),
		monitor: new ConsoleMonitor(),
	};
};
