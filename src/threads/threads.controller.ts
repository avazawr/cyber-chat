import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ThreadsService } from './threads.service.js';
import type { AuthorStats, Thread, ThreadPayload } from './thread.js';
import type { Comment, CommentPayload } from '../comments/comment.js';

@Controller('threads')
export class ThreadsController {
  constructor(private readonly threadsService: ThreadsService) {}

  @Get('')
  getThreads(@Query('author') author: string): Thread[] {
    if (!author) return this.threadsService.getAllThreads();
    else return this.threadsService.getThreadsByAuthor(author);
  }

  @Get('authors')
  getAuthorStats(): AuthorStats[] {
    return this.threadsService.getAuthorStats();
  }

  @Get(':id')
  getThreadById(@Param('id') id: string): Thread {
    return this.threadsService.findById(id);
  }

  @Post()
  createThread(@Body() body: ThreadPayload): Thread {
    if (!body || !body?.title || !body?.author || !body?.body) {
      throw new BadRequestException('Missing required fields');
    }

    return this.threadsService.create(body);
  }

  @Post(':id/comments')
  createComment(
    @Param('id') id: string,
    @Body() body: CommentPayload,
  ): Comment {
    if (!body || !body?.author || !body?.body) {
      throw new BadRequestException('Missing required fields');
    }
    return this.threadsService.addComment(id, body);
  }
}
