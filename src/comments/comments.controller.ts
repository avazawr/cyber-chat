import { Controller, Delete, Get, Param } from '@nestjs/common';

import { CommentsService } from './comments.service.js';
import type { Comment } from './comment.entity.js';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}
  @Get(':id')
  getThreadById(@Param('id') id: string): Promise<Comment> {
    return this.commentsService.findById(id);
  }

  @Delete(':id')
  deleteComment(@Param('id') id: string): Promise<Comment> {
    return this.commentsService.markDeleted(id);
  }
}
