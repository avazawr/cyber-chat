import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AuthorStats,
  Thread,
  ThreadPayload,
  ThreadWithComments,
} from './thread.js';
import { ThreadsRepository } from './threads.repository.js';
import { CommentsService } from '../comments/comments.service.js';
import { Comment, CommentPayload } from '../comments/comment.js';

@Injectable()
export class ThreadsService {
  constructor(
    private readonly threadsRepository: ThreadsRepository,
    private readonly commentsService: CommentsService,
  ) {}

  getAllThreads(): Thread[] {
    return this.threadsRepository
      .findAll()
      .toSorted((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getThreadsByAuthor(author: string) {
    return this.threadsRepository
      .findAll()
      .filter((thread) => thread.author === author)
      .toSorted((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  findById(id: string): ThreadWithComments {
    const thread = this.threadsRepository.findById(id);

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    const comments = this.commentsService.findByThread(thread.id);

    return {
      ...thread,
      comments,
    };
  }

  create(payload: ThreadPayload): Thread {
    return this.threadsRepository.create(payload);
  }

  getAuthorStats(): AuthorStats[] {
    const threads = this.threadsRepository.findAll();

    let authorsList: string[] = threads.map((thread) => thread.author);
    authorsList = [...new Set(authorsList)];

    const authors: AuthorStats[] = authorsList.map((author) => ({
      author,
      threads: threads.reduce((acc, thread) => {
        if (thread.author === author) return acc + 1;
        else return acc;
      }, 0),
    }));

    authors.sort(
      (a, b) => b.threads - a.threads || a.author.localeCompare(b.author),
    );

    return authors;
  }

  addComment(threadId: string, payload: CommentPayload): Comment {
    if (!this.findById(threadId)) {
      throw new NotFoundException('Thread not found');
    }
    return this.commentsService.create(threadId, payload);
  }

  remove(threadId: string) {
    if (this.threadsRepository.delete(threadId)) {
      this.commentsService.deleteByThread(threadId);
    } else throw new NotFoundException('Thread not found');
  }
}
