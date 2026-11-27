import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { ParseDatePipe } from './validation.pipe.js';
import { Public } from '../auth/public.decorator.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthUser } from '../auth/auth.types.js';

@Controller('threads')
export class ThreadsController {
  constructor(private readonly threadsService: ThreadsService) {}

  @Public()
  @Get('')
  async getThreads(
    @Query('author') author: string,
    @Query('since', ParseDatePipe) since: string,
  ): Promise<ThreadResponseDto[]> {
    const result = await this.threadsService.getAllThreads({
      author,
      since,
    });

    return plainToInstance(ThreadResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Public()
  @Get('authors')
  getAuthorStats(): Promise<AuthorStats[]> {
    return this.threadsService.getAuthorStats();
  }

  @Public()
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
    @CurrentUser() user: AuthUser,
    @Body() body: CreateThreadDto,
  ): Promise<ThreadResponseDto> {
    const result = await this.threadsService.create({
      title: body.title,
      body: body.body,
      author: user.username,
    });
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
    @CurrentUser() user: AuthUser,
  ): Promise<CommentResponseDto> {
    const result = await this.threadsService.addComment(id, {
      body: body.body,
      author: user.username,
    });
    return plainToInstance(CommentResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteThread(@Param('id', ParseUUIDPipe) id: string) {
    return this.threadsService.remove(id);
  }
}
