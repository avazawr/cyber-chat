import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './user.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async findByUsername(username: string) {
    const user = await this.users.findOne({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException(`User with username=${username} not found`);
    }
    return user;
  }

  async create(username: string, passwordHash: string) {
    if (await this.users.existsBy({ username })) {
      throw new ConflictException(`${username} is already exist`);
    }
    const user = this.users.create({ username, passwordHash });
    return this.users.save(user);
  }
}
