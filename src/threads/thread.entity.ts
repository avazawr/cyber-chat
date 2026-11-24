import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';

@Entity('threads')
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

  @OneToMany(() => Comment, (comment) => comment.thread)
  comments: Relation<Comment[]>;
}

//
import { Comment } from '../comments/comment.entity.js';

export type AuthorStats = {
  author: string;
  threads: number;
};

export type ThreadWithComments = Thread & {
  comments: Comment[];
};
