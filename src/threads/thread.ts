import type { Comment } from '../comments/comment.js';

export type Thread = {
  id: string;
  title: string;
  author: string;
  body: string;
  createdAt: Date;
};

export type AuthorStats = {
  author: string;
  threads: number;
};

export type ThreadPayload = Pick<Thread, 'title' | 'author' | 'body'>;

export type ThreadWithComments = Thread & {
  comments: Comment[];
};
