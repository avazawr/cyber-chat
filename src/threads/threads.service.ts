import { Injectable } from '@nestjs/common';
import { AuthorStats, sampleThreads, Thread } from './thread.js';

@Injectable()
export class ThreadsService {
  getAllThreads(): Thread[] {
    return sampleThreads.toSorted(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  getThreadsByAuthor(author: string) {
    return sampleThreads
      .filter((thread) => thread.author === author)
      .toSorted((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getAuthorStats(): AuthorStats[] {
    let authorsList: string[] = sampleThreads.map((thread) => thread.author);
    authorsList = [...new Set(authorsList)];

    const authors: AuthorStats[] = authorsList.map((author) => ({
      author,
      threads: sampleThreads.reduce((acc, thread) => {
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
