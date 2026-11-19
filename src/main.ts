import { Controller, Get, Injectable, Module, Query } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

type Thread = {
  id: string;
  title: string;
  author: string;
  body: string;
  createdAt: Date;
};

type AuthorStats = {
  author: string;
  threads: number;
};

const sampleThreads: Thread[] = [
  {
    id: "4f5362f7-ee63-495a-8903-8240d95f6625",
    title: "Tabs or spaces, final answer?",
    author: "pixelpirate",
    body: "My team argues about this in every code review. What does your formatter do?",
    createdAt: new Date("2026-11-12T08:15:00Z"),
  },
  {
    id: "733f77d2-f899-4580-8d60-8bac152930c7",
    title: "Why does my useEffect run twice?",
    author: "neonbyte",
    body: "In development, every effect in my React app runs twice. In production, it runs once.",
    createdAt: new Date("2026-11-13T19:42:00Z"),
  },
  {
    id: "43f04043-20cf-4e7a-a430-4cbdf13a5f36",
    title: "Best keyboard for long coding sessions",
    author: "nullpointer",
    body: "My wrists hurt after a full day. Split keyboard, low profile, or something else?",
    createdAt: new Date("2026-11-14T10:05:00Z"),
  },
  {
    id: "ec5074f4-aacf-4f5b-b96b-beb7763d6073",
    title: "Is SQLite enough for a side project?",
    author: "neonbyte",
    body: "I expect maybe a hundred users. Do I really need a database server?",
    createdAt: new Date("2026-11-16T21:30:00Z"),
  },
  {
    id: "1ee0c21f-27cd-4eb3-9bb6-ab1975a77f56",
    title: "Show your terminal setup",
    author: "pixelpirate",
    body: "Prompt, font, color scheme: post a screenshot and tell us what you can't live without.",
    createdAt: new Date("2026-11-17T07:55:00Z"),
  },
];

@Injectable()
class ThreadsService {
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

@Controller()
class ThreadsController {
  constructor(private readonly threadsService: ThreadsService) {}

  @Get("threads")
  getThreads(@Query("author") author: string): Thread[] {
    if (!author) return this.threadsService.getAllThreads();
    else return this.threadsService.getThreadsByAuthor(author);
  }

  @Get("threads/authors")
  getAuthorStats(): AuthorStats[] {
    return this.threadsService.getAuthorStats();
  }
}

@Module({
  controllers: [ThreadsController],
  providers: [ThreadsService],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
