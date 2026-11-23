import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('thread')
export class Thread {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column()
  body: string;

  @CreateDateColumn()
  createdAt: Date;
}

export type ThreadPayload = Pick<Thread, 'title' | 'author' | 'body'>;

///
import type { Comment } from '../comments/comment.js';

export type AuthorStats = {
  author: string;
  threads: number;
};

export type ThreadWithComments = Thread & {
  comments: Comment[];
};
