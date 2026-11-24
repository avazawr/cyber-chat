import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ThreadsService } from './threads.service.js';
import type { AuthorStats, Thread } from './thread.entity.js';
import type { Comment } from '../comments/comment.entity.js';
import { CreateThreadDto } from './dto/create-thread.dto.js';
import { CreateCommentDto } from '../comments/dto/create-comment.dto.js';
import { UpdateThreadDto } from './dto/update-thread.dto.js';
import { ThreadResponseDto } from './dto/thread-response.dto.js';
import { plainToInstance } from 'class-transformer';
import { CommentResponseDto } from '../comments/dto/comment-response.dto.js';

@Controller('threads')
export class ThreadsController {
  constructor(private readonly threadsService: ThreadsService) {}

  @Get('')
  async getThreads(
    @Query('author') author: string,
  ): Promise<ThreadResponseDto[]> {
    let result;
    if (!author) result = await this.threadsService.getAllThreads();
    else result = await this.threadsService.getThreadsByAuthor(author);

    return plainToInstance(ThreadResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get('authors')
  getAuthorStats(): Promise<AuthorStats[]> {
    return this.threadsService.getAuthorStats();
  }

  @Get(':id')
  async getThreadById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ThreadResponseDto> {
    const result = await this.threadsService.findById(id);
    return plainToInstance(ThreadResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  async createThread(
    @Body() body: CreateThreadDto,
  ): Promise<ThreadResponseDto> {
    const result = await this.threadsService.create(body);
    return plainToInstance(ThreadResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  async updateThread(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateThreadDto,
  ): Promise<ThreadResponseDto> {
    const result = await this.threadsService.update(id, body);
    return plainToInstance(ThreadResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Post(':id/comments')
  async createComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    const result = await this.threadsService.addComment(id, body);
    return plainToInstance(CommentResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  deleteThread(@Param('id', ParseUUIDPipe) id: string) {
    return this.threadsService.remove(id);
  }
}
