import { Controller, Delete, Get, Param, ParseUUIDPipe } from '@nestjs/common';

import { CommentsService } from './comments.service.js';
import { CommentResponseDto } from './dto/comment-response.dto.js';
import { plainToInstance } from 'class-transformer';
import { Public } from '../auth/public.decorator.js';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Public()
  @Get(':id')
  async getCommentById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CommentResponseDto> {
    const result = await this.commentsService.findById(id);

    return plainToInstance(CommentResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  async deleteComment(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CommentResponseDto> {
    const result = await this.commentsService.markDeleted(id);
    return plainToInstance(CommentResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }
}
