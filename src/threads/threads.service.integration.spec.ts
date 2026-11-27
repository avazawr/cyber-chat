// src/products/products.service.integration.spec.ts
import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThreadsService } from './threads.service.js';
import { ThreadsModule } from './threads.module.js';
import { CommentsService } from '../comments/comments.service.js';

describe('ThreadsService with a database', () => {
  let moduleRef: TestingModule;
  let threadsService: ThreadsService;
  let commentsService: CommentsService;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          autoLoadEntities: true,
          synchronize: true,
        }),
        ThreadsModule,
      ],
    }).compile();

    threadsService = moduleRef.get(ThreadsService);
    commentsService = moduleRef.get(CommentsService);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('create a thread, add a comment, delete the thread', async () => {
    const newthread = await threadsService.create({
      title: 'Title',
      author: 'Author',
      body: 'Text',
    });
    const newComment = await threadsService.addComment(newthread.id, {
      author: 'Comment Author',
      body: 'Comment Text',
    });

    await threadsService.remove(newthread.id);

    await expect(commentsService.findById(newComment.id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('Soft delete', async () => {
    const newthread = await threadsService.create({
      title: 'Title',
      author: 'Author',
      body: 'Text',
    });
    const newComment = await threadsService.addComment(newthread.id, {
      author: 'Comment Author',
      body: 'Comment Text',
    });

    await commentsService.markDeleted(newComment.id);

    const thread = await threadsService.findById(newthread.id);

    expect(thread.comments).toEqual([
      expect.objectContaining({
        id: newComment.id,
        body: 'deleted',
      }),
    ]);
  });

  it('Filter: create threads of two authors, then check the length of the list with an author and without one.', async () => {
    const newthread = await threadsService.create({
      title: 'Title',
      author: 'Author',
      body: 'Text',
    });
    const newthread2 = await threadsService.create({
      title: 'Title',
      author: 'Author2',
      body: 'Text',
    });

    expect((await threadsService.getAllThreads({})).length).toBe(2);
    expect(
      (await threadsService.getAllThreads({ author: 'Author2' })).length,
    ).toBe(1);
  });
});
