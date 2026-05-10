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
  const [session] = await db.collection<{ userId: string }>('session');
  const users = await db.collection<User>('users');
  const user = users.find((item) => item.id === session?.userId);
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
    const [session] = await this.db.collection<{ userId: string }>('session');
    if (!session) return null;
    const users = await this.db.collection<User & { password?: string }>(
      'users',
    );
    return users.find((user) => user.id === session.userId) ?? null;
  }

  async login(input: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const users = await this.db.collection<User & { password?: string }>(
      'users',
    );
    const user = users.find(
      (candidate) =>
        candidate.email === input.email &&
        candidate.password === input.password,
    );
    if (!user) throw new Error('Invalid username or password');
    await this.db.replaceCollection('session', [{ userId: user.id }]);
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
    const users = await this.db.collection<User & { password?: string }>(
      'users',
    );
    if (users.some((user) => user.email === input.email)) {
      throw new Error('The user already exists');
    }

    const teams = await this.db.collection<Team>('teams');
    let teamId = input.teamId ?? '';
    let role: User['role'] = 'USER';
    if (!teamId) {
      role = 'ADMIN';
      teamId = createId();
      teams.push({
        id: teamId,
        createdAt: now(),
        name: input.teamName || `${input.firstName} Team`,
        description: '',
      });
      await this.db.replaceCollection('teams', teams);
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
    users.push(user);
    await this.db.replaceCollection('users', users);
    await this.db.replaceCollection('session', [{ userId: user.id }]);
    return { jwt: btoa(JSON.stringify({ id: user.id })), user };
  }

  async logout() {
    await this.db.replaceCollection('session', []);
  }
}

class LocalTeamStore {
  constructor(private readonly db: LocalDatabase) {}

  async listTeams() {
    return { data: await this.db.collection<Team>('teams') };
  }
}

class LocalUserStore {
  constructor(private readonly db: LocalDatabase) {}

  async listUsers() {
    const users = await this.db.collection<User>('users');
    return { data: users };
  }

  async updateProfile(input: {
    email: string;
    firstName: string;
    lastName: string;
    bio: string;
  }) {
    const users = await this.db.collection<User>('users');
    const [session] = await this.db.collection<{ userId: string }>('session');
    const index = users.findIndex((user) => user.id === session?.userId);
    if (index < 0) throw new Error('Unauthorized');
    users[index] = { ...users[index], ...input };
    await this.db.replaceCollection('users', users);
    return users[index];
  }

  async deleteUser(userId: string) {
    await requireAdmin(this.db);
    const users = await this.db.collection<User>('users');
    const deleted = users.find((user) => user.id === userId);
    if (!deleted) throw new Error('Not found');
    await this.db.replaceCollection(
      'users',
      users.filter((user) => user.id !== userId),
    );
    return deleted;
  }
}

class LocalDiscussionStore {
  constructor(private readonly db: LocalDatabase) {}

  async listDiscussions(currentPage = 1) {
    const discussions = await this.withAuthors();
    return page(discussions, currentPage);
  }

  async getDiscussion(discussionId: string) {
    const discussion = (await this.withAuthors()).find(
      (item) => item.id === discussionId,
    );
    if (!discussion) throw new Error('Discussion not found');
    return { data: discussion };
  }

  async createDiscussion(input: { title: string; body: string }) {
    const user = await requireAdmin(this.db);
    const discussions = await this.db.collection<
      Discussion & { authorId?: string }
    >('discussions');
    const discussion = {
      id: createId(),
      createdAt: now(),
      title: input.title,
      body: input.body,
      teamId: user.teamId,
      authorId: user.id,
      author: user,
    };
    discussions.push(discussion);
    await this.db.replaceCollection('discussions', discussions);
    return discussion;
  }

  async updateDiscussion(
    discussionId: string,
    input: { title: string; body: string },
  ) {
    await requireAdmin(this.db);
    const discussions = await this.db.collection<
      Discussion & { authorId?: string }
    >('discussions');
    const index = discussions.findIndex((item) => item.id === discussionId);
    if (index < 0) throw new Error('Discussion not found');
    discussions[index] = { ...discussions[index], ...input };
    await this.db.replaceCollection('discussions', discussions);
    return (await this.getDiscussion(discussionId)).data;
  }

  async deleteDiscussion(discussionId: string) {
    await requireAdmin(this.db);
    const discussion = (await this.getDiscussion(discussionId)).data;
    const discussions = await this.db.collection<Discussion>('discussions');
    await this.db.replaceCollection(
      'discussions',
      discussions.filter((item) => item.id !== discussionId),
    );
    return discussion;
  }

  private async withAuthors() {
    const users = await this.db.collection<User>('users');
    const discussions = await this.db.collection<
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
    const comments = (await this.withAuthors()).filter(
      (comment) => comment.discussionId === discussionId,
    );
    return page(comments, currentPage);
  }

  async createComment(input: { discussionId: string; body: string }) {
    const user = await currentUser(this.db);
    const comments = await this.db.collection<Comment & { authorId?: string }>(
      'comments',
    );
    const comment = {
      id: createId(),
      createdAt: now(),
      body: input.body,
      discussionId: input.discussionId,
      authorId: user.id,
      author: user,
    };
    comments.push(comment);
    await this.db.replaceCollection('comments', comments);
    return comment;
  }

  async deleteComment(commentId: string) {
    const user = await currentUser(this.db);
    const comments = await this.db.collection<Comment>('comments');
    const comment = comments.find((item) => item.id === commentId);
    if (!comment) throw new Error('Not found');
    const authorId =
      'authorId' in comment ? comment.authorId : comment.author.id;
    if (user.role !== 'ADMIN' && authorId !== user.id) {
      throw new Error('Not found');
    }
    await this.db.replaceCollection(
      'comments',
      comments.filter((item) => item.id !== commentId),
    );
    return comment;
  }

  private async withAuthors() {
    const users = await this.db.collection<User>('users');
    const comments = await this.db.collection<Comment & { authorId?: string }>(
      'comments',
    );
    return comments.map((comment) => ({
      ...comment,
      author:
        users.find((user) => user.id === comment.authorId) ?? comment.author,
    }));
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
