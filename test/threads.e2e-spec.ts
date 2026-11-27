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

  //write without a token
  it('write without a token', async () => {
    const response = await request(app.getHttpServer())
      .post('/threads')
      .send({
        title: 'Hello',
        body: 'My 1nd thread',
      })
      .expect(401);
  });
  //author comes from the token
  it('author comes from the token', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'ada', password: 'correct horse battery staple' })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'ada', password: 'correct horse battery staple' })
      .expect(200);

    const response = await request(app.getHttpServer())
      .post('/threads')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .send({
        title: 'Hello',
        body: 'My 1nd thread',
      })
      .expect(201);

    expect(response.body.author).toEqual('ada');
  });

  //Life of a thread
  it('Life of a thread', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'ada', password: 'correct horse battery staple' })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'ada', password: 'correct horse battery staple' })
      .expect(200);

    const response = await request(app.getHttpServer())
      .post('/threads')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .send({
        title: 'Hello',
        body: 'My 1nd thread',
      })
      .expect(201);

    const threadId = response.body.id;

    await request(app.getHttpServer())
      .post(`/threads/${threadId}/comments`)
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .send({
        body: 'My comment',
      })
      .expect(201);

    const threadResponse = await request(app.getHttpServer())
      .get(`/threads/${threadId}`)
      .expect(200);

    expect(threadResponse.body.comments).toHaveLength(1);

    expect(threadResponse.body.comments[0]).toEqual(
      expect.objectContaining({
        author: 'ada',
        body: 'My comment',
      }),
    );

    await request(app.getHttpServer())
      .delete(`/threads/${threadId}`)
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/comments/${threadResponse.body.comments[0].id}`)
      .expect(404);
  });
});
