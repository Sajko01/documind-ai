import {
  ConflictException,
  Injectable,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import {
  User,
  UserRole,
} from './entities/user.entity';

import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({
        where: {
            email,
        },
        relations: {
            organization: true,
        },
        });
    }

    async findById(id: string): Promise<User | null> {
        return this.usersRepository.findOne({
        where: {
            id,
        },
        relations: {
            organization: true,
        },
        });
    }

  async create(
    dto: CreateUserDto,
    organizationId: string,
    role: UserRole = UserRole.EMPLOYEE,
  ): Promise<User> {
    const existingUser =
      await this.usersRepository.findOne({
        where: {
          email: dto.email,
        },
      });

    if (existingUser) {
      throw new ConflictException({
        success: false,
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'A user with this email already exists',
        },
      });
    }

    const passwordHash =
      await bcrypt.hash(dto.password, 12);

    const user = this.usersRepository.create({
      organizationId,
      name: dto.name,
      email: dto.email,
      passwordHash,
      role,
    });

    return this.usersRepository.save(user);
  }

  async createWithPassword(
    name: string,
    email: string,
    password: string,
    organizationId: string,
    role: UserRole,
  ): Promise<User> {
    const existingUser =
      await this.findByEmail(email);

    if (existingUser) {
      throw new ConflictException({
        success: false,
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'A user with this email already exists',
        },
      });
    }

    const passwordHash =
      await bcrypt.hash(password, 12);

    const user = this.usersRepository.create({
      organizationId,
      name,
      email,
      passwordHash,
      role,
    });

    return this.usersRepository.save(user);
  }

  async validatePassword(
    password: string,
    passwordHash: string,
  ): Promise<boolean> {
    return bcrypt.compare(
      password,
      passwordHash,
    );
  }
}