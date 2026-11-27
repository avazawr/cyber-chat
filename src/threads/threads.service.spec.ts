import { Test, TestingModule } from '@nestjs/testing';
import { ThreadsService } from './threads.service.js';
import { Thread } from './thread.entity.js';
import type { Repository } from 'typeorm';
import { CommentsService } from '../comments/comments.service.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from '../comments/dto/create-comment.dto.js';

const threads = {
  findOne: vi.fn(),
  find: vi.fn(),
  delete: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
} satisfies Partial<Repository<Thread>>;

const commentsService = {
  countByThreadId: vi.fn(),
  create: vi.fn(),
} satisfies Partial<CommentsService>;

describe('ThreadsService', () => {
  let service: ThreadsService;

  beforeEach(async () => {
    vi.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ThreadsService,
        { provide: getRepositoryToken(Thread), useValue: threads },
        { provide: CommentsService, useValue: commentsService },
      ],
    }).compile();

    service = moduleRef.get(ThreadsService);
  });

  // findById()
  it('throws a NotFoundException for an unknown ID', async () => {
    threads.findOne.mockResolvedValue(null);

    await expect(service.findById('unknown')).rejects.toThrow(
      NotFoundException,
    );
  });

  // addComment()
  it('addComment for a thread that does not exist', async () => {
    threads.findOne.mockResolvedValue(null);

    const comment: CreateCommentDto = {
      author: 'author name',
      body: 'text',
    };

    await expect(service.addComment('unknown', comment)).rejects.toThrow(
      NotFoundException,
    );

    expect(commentsService.create).not.toHaveBeenCalled();
  });
});
