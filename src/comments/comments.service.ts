import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentsRepository } from './сomments.repository.js';
import type { Comment, CommentPayload } from './comment.js';

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  findById(id: string): Comment {
    const comment = this.commentsRepository.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  findByThread(threadId: string): Comment[] {
    return this.commentsRepository.findByThread(threadId);
  }

  create(hreadId: string, payload: CommentPayload): Comment {
    return this.commentsRepository.create(hreadId, payload);
  }

  markDeleted(id: string) {
    const comment = this.commentsRepository.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    comment.body = 'deleted';
    return this.commentsRepository.edit(comment);
  }

  deleteByThread(threadId: string) {
    this.commentsRepository.deleteByThread(threadId);
  }
}
