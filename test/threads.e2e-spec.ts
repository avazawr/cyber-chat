import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';

describe('Users (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule], // This pulls in the entire application tree
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  //Life of a thread
  it('POST /threads', async () => {
    const response = await request(app.getHttpServer())
      .post('/threads')
      .send({
        title: 'Hello',
        author: 'Author',
        body: 'My 1nd thread',
      })
      .expect(201);

    const threadId = response.body.id;

    await request(app.getHttpServer())
      .post(`/threads/${threadId}/comments`)
      .send({
        author: 'Comment Author',
        body: 'My comment',
      })
      .expect(201);

    const threadResponse = await request(app.getHttpServer())
      .get(`/threads/${threadId}`)
      .expect(200);

    expect(threadResponse.body.comments).toHaveLength(1);

    expect(threadResponse.body.comments[0]).toEqual(
      expect.objectContaining({
        author: 'Comment Author',
        body: 'My comment',
      }),
    );

    await request(app.getHttpServer())
      .delete(`/threads/${threadId}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/comments/${threadResponse.body.comments[0].id}`)
      .expect(404);
  });
});
