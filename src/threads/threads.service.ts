import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthorStats, Thread, ThreadPayload } from './thread.js';
import { ThreadsRepository } from './threads.repository.js';

@Injectable()
export class ThreadsService {
  constructor(private readonly threadsRepository: ThreadsRepository) {}

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

  findById(id: string): Thread {
    const thread = this.threadsRepository.findById(id);

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }
    return thread;
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
}
