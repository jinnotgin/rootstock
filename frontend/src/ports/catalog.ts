import { Comment, Discussion, Paginated, Team, User } from '@/domain/types';

export type UpdateProfileInput = {
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
};

export type DiscussionInput = {
  title: string;
  body: string;
};

export type CreateCommentInput = {
  discussionId: string;
  body: string;
};

export interface TeamStore {
  listTeams(): Promise<{ data: Team[] }>;
}

export interface UserStore {
  listUsers(): Promise<{ data: User[] }>;
  updateProfile(input: UpdateProfileInput): Promise<User>;
  deleteUser(userId: string): Promise<User>;
}

export interface DiscussionStore {
  listDiscussions(page?: number): Promise<Paginated<Discussion>>;
  getDiscussion(discussionId: string): Promise<{ data: Discussion }>;
  createDiscussion(input: DiscussionInput): Promise<Discussion>;
  updateDiscussion(
    discussionId: string,
    input: DiscussionInput,
  ): Promise<Discussion>;
  deleteDiscussion(discussionId: string): Promise<Discussion>;
}

export interface CommentStore {
  listComments(input: {
    discussionId: string;
    page?: number;
  }): Promise<Paginated<Comment>>;
  createComment(input: CreateCommentInput): Promise<Comment>;
  deleteComment(commentId: string): Promise<Comment>;
}
