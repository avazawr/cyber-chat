import { Controller, Get, Query } from '@nestjs/common';
import { ThreadsService } from './threads.service.js';
import { AuthorStats, Thread } from './thread.js';

@Controller('threads')
export class ThreadsController {
  constructor(private readonly threadsService: ThreadsService) {}

  @Get('')
  getThreads(@Query('author') author: string): Thread[] {
    if (!author) return this.threadsService.getAllThreads();
    else return this.threadsService.getThreadsByAuthor(author);
  }

  @Get('/authors')
  getAuthorStats(): AuthorStats[] {
    return this.threadsService.getAuthorStats();
  }
}
