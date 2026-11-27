import {
  Injectable,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { AuthorStats, Thread } from './thread.entity.js';
import { CommentsService } from '../comments/comments.service.js';
import { Comment } from '../comments/comment.entity.js';
import { CreateThreadDto } from './dto/create-thread.dto.js';
import { CreateCommentDto } from '../comments/dto/create-comment.dto.js';
import { UpdateThreadDto } from './dto/update-thread.dto.js';

const sampleThreads: CreateThreadDto[] = [
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

  async getAllThreads(filters: {
    author?: string;
    since?: string;
  }): Promise<Thread[]> {
    const where = {
      ...(filters.author && { author: filters.author }),
      ...(filters.since && {
        createdAt: MoreThanOrEqual(new Date(filters.since)),
      }),
    };

    const threads = await this.threads.find({
      where,
      //relations: { comments: true },
      order: { createdAt: 'DESC' },
    });

    return Promise.all(
      threads.map(async (thread) => ({
        ...thread,
        commentCount: await this.commentsService.countByThreadId(thread.id),
      })),
    );
  }

  async findById(id: string): Promise<Thread> {
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

  async create(
    payload: Pick<Thread, 'title' | 'author' | 'body'>,
  ): Promise<Thread> {
    // 1. Synchronous: builds the entity instance in memory
    const thread = this.threads.create(payload);

    // 2. Asynchronous: runs the INSERT statement
    return this.threads.save(thread);
  }

  async update(id: string, dto: UpdateThreadDto): Promise<Thread> {
    const thread = await this.findById(id);
    this.threads.merge(thread, dto);
    return this.threads.save(thread);
  }

  async remove(threadId: string) {
    const result = await this.threads.delete(threadId);

    if (!result.affected) {
      throw new NotFoundException('Thread not found');
    }
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

  async addComment(
    threadId: string,
    payload: Pick<Comment, 'author' | 'body'>,
  ): Promise<Comment> {
    // id check
    await this.findById(threadId);

    return this.commentsService.create(threadId, payload);
  }
}
