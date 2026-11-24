import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ThreadsService } from './threads.service.js';
import type { AuthorStats, Thread } from './thread.entity.js';
import type { Comment } from '../comments/comment.entity.js';
import { CreateThreadDto } from './dto/create-thread.dto.js';
import { CreateCommentDto } from '../comments/dto/create-comment.dto.js';

@Controller('threads')
export class ThreadsController {
  constructor(private readonly threadsService: ThreadsService) {}

  @Get('')
  getThreads(@Query('author') author: string): Promise<Thread[]> {
    if (!author) return this.threadsService.getAllThreads();
    else return this.threadsService.getThreadsByAuthor(author);
  }

  @Get('authors')
  getAuthorStats(): Promise<AuthorStats[]> {
    return this.threadsService.getAuthorStats();
  }

  @Get(':id')
  getThreadById(@Param('id') id: string): Promise<Thread> {
    return this.threadsService.findById(id);
  }

  @Post()
  createThread(@Body() body: CreateThreadDto): Promise<Thread> {
    return this.threadsService.create(body);
  }

  @Post(':id/comments')
  createComment(
    @Param('id') id: string,
    @Body() body: CreateCommentDto,
  ): Promise<Comment> {
    return this.threadsService.addComment(id, body);
  }

  @Delete(':id')
  deleteThread(@Param('id') id: string) {
    return this.threadsService.remove(id);
  }
}
