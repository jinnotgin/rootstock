import {
  AuthResponse,
  Comment,
  Discussion,
  Paginated,
  Team,
  User,
} from '@/domain/types';
import { api } from '@/lib/api-client';
import { AppServices } from '@/services/app-services-provider';

class ApiAuthProvider {
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 401) return null;
      throw error;
    }
  }

  async login(input: { email: string; password: string }) {
    return (await api.post('/auth/login', input)) as unknown as AuthResponse;
  }

  async register(input: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    teamId?: string | null;
    teamName?: string | null;
  }) {
    return (await api.post('/auth/register', input)) as unknown as AuthResponse;
  }

  async logout() {
    await api.post('/auth/logout');
  }
}

class ApiTeamStore {
  async listTeams() {
    return (await api.get('/teams')) as unknown as { data: Team[] };
  }
}

class ApiUserStore {
  async listUsers() {
    return (await api.get('/users')) as unknown as { data: User[] };
  }

  async updateProfile(input: {
    email: string;
    firstName: string;
    lastName: string;
    bio: string;
  }) {
    return (await api.patch('/users/profile', input)) as unknown as User;
  }

  async deleteUser(userId: string) {
    return (await api.delete(`/users/${userId}`)) as unknown as User;
  }
}

class ApiDiscussionStore {
  async listDiscussions(page = 1) {
    return (await api.get('/discussions', {
      params: { page },
    })) as unknown as Paginated<Discussion>;
  }

  async getDiscussion(discussionId: string) {
    return (await api.get(`/discussions/${discussionId}`)) as unknown as {
      data: Discussion;
    };
  }

  async createDiscussion(input: { title: string; body: string }) {
    return (await api.post('/discussions', input)) as unknown as Discussion;
  }

  async updateDiscussion(
    discussionId: string,
    input: { title: string; body: string },
  ) {
    return (await api.patch(
      `/discussions/${discussionId}`,
      input,
    )) as unknown as Discussion;
  }

  async deleteDiscussion(discussionId: string) {
    return (await api.delete(
      `/discussions/${discussionId}`,
    )) as unknown as Discussion;
  }
}

class ApiCommentStore {
  async listComments({
    discussionId,
    page = 1,
  }: {
    discussionId: string;
    page?: number;
  }) {
    return (await api.get('/comments', {
      params: { discussionId, page },
    })) as unknown as Paginated<Comment>;
  }

  async createComment(input: { discussionId: string; body: string }) {
    return (await api.post('/comments', input)) as unknown as Comment;
  }

  async deleteComment(commentId: string) {
    return (await api.delete(`/comments/${commentId}`)) as unknown as Comment;
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

class InMemoryFlagProvider {
  isEnabled() {
    return false;
  }
}

export const makeApiServices = (): AppServices => ({
  auth: new ApiAuthProvider(),
  teams: new ApiTeamStore(),
  users: new ApiUserStore(),
  discussions: new ApiDiscussionStore(),
  comments: new ApiCommentStore(),
  flags: new InMemoryFlagProvider(),
  monitor: new ConsoleMonitor(),
});
