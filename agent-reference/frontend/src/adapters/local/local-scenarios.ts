import { Comment, Discussion, Team, User } from '@/domain/types';

import { DatabaseShape } from './local-database';

export type LocalScenario =
  | 'empty'
  | 'logged-out'
  | 'admin'
  | 'normal-user'
  | 'expired-session'
  | 'permission-denied'
  | 'discussion-with-comments'
  | 'no-comments';

const team: Team = {
  id: 'team-local-1',
  createdAt: 1715299200000,
  name: 'Local Demo Team',
  description: 'Seeded local scenario team',
};

const admin: User & { password?: string } = {
  id: 'user-admin-1',
  createdAt: 1715299201000,
  firstName: 'Ada',
  lastName: 'Admin',
  email: 'admin@example.com',
  role: 'ADMIN',
  teamId: team.id,
  bio: 'Local admin scenario user',
  password: 'password',
};

const normalUser: User & { password?: string } = {
  id: 'user-normal-1',
  createdAt: 1715299202000,
  firstName: 'Grace',
  lastName: 'User',
  email: 'user@example.com',
  role: 'USER',
  teamId: team.id,
  bio: 'Local normal-user scenario user',
  password: 'password',
};

const discussion: Discussion & { authorId?: string } = {
  id: 'discussion-local-1',
  createdAt: 1715299203000,
  title: 'Local scenario discussion',
  body: 'This discussion is seeded by the local scenario adapter.',
  teamId: team.id,
  authorId: admin.id,
  author: admin,
};

const comments: Array<Comment & { authorId?: string }> = [
  {
    id: 'comment-local-1',
    createdAt: 1715299204000,
    body: 'First seeded comment.',
    discussionId: discussion.id,
    authorId: normalUser.id,
    author: normalUser,
  },
  {
    id: 'comment-local-2',
    createdAt: 1715299205000,
    body: 'Second seeded comment.',
    discussionId: discussion.id,
    authorId: admin.id,
    author: admin,
  },
];

const baseData = (): DatabaseShape => ({
  session: [],
  teams: [team],
  users: [admin, normalUser],
  discussions: [discussion],
  comments: [],
});

export const localScenarioData = (
  scenario: LocalScenario = 'empty',
): DatabaseShape => {
  switch (scenario) {
    case 'logged-out':
      return baseData();
    case 'admin':
    case 'no-comments':
      return { ...baseData(), session: [{ userId: admin.id }] };
    case 'normal-user':
    case 'permission-denied':
      return { ...baseData(), session: [{ userId: normalUser.id }] };
    case 'expired-session':
      return { ...baseData(), session: [{ userId: 'expired-user' }] };
    case 'discussion-with-comments':
      return {
        ...baseData(),
        session: [{ userId: admin.id }],
        comments,
      };
    case 'empty':
    default:
      return {
        session: [],
        teams: [],
        users: [],
        discussions: [],
        comments: [],
      };
  }
};
