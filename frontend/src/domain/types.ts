export type {
  AuthResponse,
  Comment,
  Discussion,
  Meta,
  Team,
  User,
} from '@/types/api';

export type Paginated<T> = {
  data: T[];
  meta: {
    page: number;
    total: number;
    totalPages: number;
  };
};
