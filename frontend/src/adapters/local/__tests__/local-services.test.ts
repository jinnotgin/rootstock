import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeLocalServices } from '../local-services';

const fallbackKey = 'ai-dlc-local-db';

describe('makeLocalServices', () => {
  beforeEach(() => {
    vi.stubGlobal('indexedDB', undefined);
    window.localStorage.clear();
  });

  it('prevents non-admin users from writing admin-only resources', async () => {
    window.localStorage.setItem(
      fallbackKey,
      JSON.stringify({
        session: [{ userId: 'user-1' }],
        teams: [
          {
            id: 'team-1',
            createdAt: 1715299200000,
            name: 'Ada Team',
            description: '',
          },
        ],
        users: [
          {
            id: 'user-1',
            createdAt: 1715299200000,
            firstName: 'Ada',
            lastName: 'Lovelace',
            email: 'ada@example.com',
            role: 'USER',
            teamId: 'team-1',
            bio: '',
          },
          {
            id: 'user-2',
            createdAt: 1715299200001,
            firstName: 'Grace',
            lastName: 'Hopper',
            email: 'grace@example.com',
            role: 'USER',
            teamId: 'team-1',
            bio: '',
          },
        ],
        discussions: [
          {
            id: 'discussion-1',
            createdAt: 1715299200002,
            title: 'Existing discussion',
            body: 'Existing body.',
            teamId: 'team-1',
            authorId: 'user-2',
          },
        ],
        comments: [],
      }),
    );
    const services = makeLocalServices();

    await expect(
      services.discussions.createDiscussion({
        title: 'Release planning',
        body: 'Coordinate the next release.',
      }),
    ).rejects.toThrow('Forbidden');
    await expect(
      services.discussions.updateDiscussion('discussion-1', {
        title: 'Updated',
        body: 'Updated body.',
      }),
    ).rejects.toThrow('Forbidden');
    await expect(
      services.discussions.deleteDiscussion('discussion-1'),
    ).rejects.toThrow('Forbidden');
    await expect(services.users.deleteUser('user-2')).rejects.toThrow(
      'Forbidden',
    );
  });

  it('prevents users from deleting comments they do not own', async () => {
    window.localStorage.setItem(
      fallbackKey,
      JSON.stringify({
        session: [{ userId: 'user-1' }],
        teams: [],
        users: [
          {
            id: 'user-1',
            createdAt: 1715299200000,
            firstName: 'Ada',
            lastName: 'Lovelace',
            email: 'ada@example.com',
            role: 'USER',
            teamId: 'team-1',
            bio: '',
          },
          {
            id: 'user-2',
            createdAt: 1715299200001,
            firstName: 'Grace',
            lastName: 'Hopper',
            email: 'grace@example.com',
            role: 'USER',
            teamId: 'team-1',
            bio: '',
          },
        ],
        discussions: [],
        comments: [
          {
            id: 'comment-1',
            createdAt: 1715299200002,
            body: 'Owned by someone else.',
            discussionId: 'discussion-1',
            authorId: 'user-2',
          },
        ],
      }),
    );

    await expect(
      makeLocalServices().comments.deleteComment('comment-1'),
    ).rejects.toThrow('Not found');
  });

  it('seeds selectable local scenarios without persisting over user data', async () => {
    const services = makeLocalServices({
      scenario: 'discussion-with-comments',
    });

    await expect(services.auth.getCurrentUser()).resolves.toMatchObject({
      email: 'admin@example.com',
      role: 'ADMIN',
    });
    const discussions = await services.discussions.listDiscussions();
    expect(discussions.data).toHaveLength(1);
    const comments = await services.comments.listComments({
      discussionId: discussions.data[0].id,
    });
    expect(comments.data).toHaveLength(2);
  });
});
