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

  //registers a user
  it('Create new User', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'ada', password: 'correct horse battery staple' })
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(String),
      username: 'ada',
    });
  });

  //returns 409 if username already exists
  it('Returns 409 if user already exists', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'ada', password: 'correct horse battery staple' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'ada', password: 'correct horse battery staple' })
      .expect(409);
  });

  // Login user
  it('Login user', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'ada', password: 'correct horse battery staple' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'ada', password: 'correct horse battery staple' })
      .expect(200);

    expect(response.body).toEqual({
      accessToken: expect.any(String),
    });
  });

  // Login wrong user
  it('Login wrong user', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'ada', password: 'correct horse battery staple' })
      .expect(201);

    const response1 = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'ada11', password: 'correct horse battery staple' })
      .expect(401);

    expect(response1.body.message).toBe('Invalid username or password');

    const response2 = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'ada', password: 'correct horse battery staple11' })
      .expect(401);

    expect(response2.body.message).toBe('Invalid username or password');
  });
});
