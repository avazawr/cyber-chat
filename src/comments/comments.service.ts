import { Injectable, NotFoundException } from '@nestjs/common';

import { Comment, CommentPayload } from './comment.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly comments: Repository<Comment>,
  ) {}

  async findById(id: string): Promise<Comment> {
    const comment = await this.comments.findOneBy({ id });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    return comment;
  }

  async create(threadId: string, payload: CommentPayload): Promise<Comment> {
    // 1. Synchronous: builds the entity instance in memory
    const comment = this.comments.create({
      ...payload,
      threadId,
    });
    // 2. Asynchronous: runs the INSERT statement
    return this.comments.save(comment);
  }

  async markDeleted(id: string) {
    const comment = await this.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    comment.body = 'deleted';
    return this.comments.save(comment);
  }

  countByThreadId(threadId: string): Promise<number> {
    return this.comments.count({
      where: { threadId },
    });
  }
}
