import {
  Injectable,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AuthorStats,
  Thread,
  ThreadPayload,
  ThreadWithComments,
} from './thread.entity.js';
import { CommentsService } from '../comments/comments.service.js';
import { Comment, CommentPayload } from '../comments/comment.entity.js';

const sampleThreads: ThreadPayload[] = [
  // {
  //   title: 'Tabs or spaces, final answer?',
  //   author: 'pixelpirate',
  //   body: 'My team argues about this in every code review. What does your formatter do?',
  // },
  // {
  //   title: 'Is SQLite enough for a side project?',
  //   author: 'neonbyte',
  //   body: 'I expect maybe a hundred users. Do I really need a database server?',
  // },
];

@Injectable()
export class ThreadsService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Thread)
    private readonly threads: Repository<Thread>,
    private readonly commentsService: CommentsService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if ((await this.threads.count()) > 0) return;
    await this.threads.save(this.threads.create(sampleThreads));
  }

  async getAllThreads(): Promise<Thread[]> {
    return this.threads.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getThreadsByAuthor(author: string): Promise<Thread[]> {
    return this.threads.find({
      where: { author },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<ThreadWithComments> {
    const thread = await this.threads.findOne({
      where: { id },
      relations: { comments: true },
      order: { comments: { createdAt: 'ASC' } },
    });

    if (!thread) {
      throw new NotFoundException(`Thread with ID ${id} not found`);
    }
    return thread;
  }

  async create(payload: ThreadPayload): Promise<Thread> {
    // 1. Synchronous: builds the entity instance in memory
    const thread = this.threads.create(payload);

    // 2. Asynchronous: runs the INSERT statement
    return this.threads.save(thread);
  }

  async getAuthorStats(): Promise<AuthorStats[]> {
    const threads = await this.threads.find({
      order: { createdAt: 'DESC' },
    });

    let authorsList: string[] = threads.map((thread) => thread.author);
    authorsList = [...new Set(authorsList)];

    const authors: AuthorStats[] = authorsList.map((author) => ({
      author,
      threads: threads.reduce((acc, thread) => {
        if (thread.author === author) return acc + 1;
        else return acc;
      }, 0),
    }));

    authors.sort(
      (a, b) => b.threads - a.threads || a.author.localeCompare(b.author),
    );

    return authors;
  }

  //TODO
  async addComment(
    threadId: string,
    payload: CommentPayload,
  ): Promise<Comment> {
    if (!this.findById(threadId)) {
      throw new NotFoundException('Thread not found');
    }
    return this.commentsService.create(threadId, payload);
  }

  async remove(threadId: string) {
    const result = await this.threads.delete(threadId);

    if (!result.affected) {
      throw new NotFoundException('Thread not found');
    }
  }
}
