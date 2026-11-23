// src/data-source.ts
import { DataSource } from 'typeorm';
import { Thread } from './threads/thread.entity.js';
import { Comment } from './comments/comment.entity.js';

process.loadEnvFile();

const database = process.env.DATABASE_PATH;
if (!database) {
  throw new Error('DATABASE_PATH is missing in .env');
}

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database,
  entities: [Thread, Comment],
  migrations: ['dist/migrations/*.js'],
});
