import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import { OrganizationsService } from '../organizations/organizations.service';

import {
  UserRole,
} from '../users/entities/user.entity';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly organizationsService:
      OrganizationsService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser =
      await this.usersService.findByEmail(
        dto.email,
      );

    if (existingUser) {
      throw new ConflictException({
        success: false,
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message:
            'A user with this email already exists',
        },
      });
    }

   const organization = await this.organizationsService.create({
  name: dto.organizationName, // Objekat koji odgovara CreateOrganizationDto
});

    const user =
      await this.usersService.createWithPassword(
        dto.name,
        dto.email,
        dto.password,
        organization.id,
        UserRole.ADMIN,
      );

    const accessToken =
      await this.generateAccessToken(user);

    return {
      success: true,
      data: {
        access_token: accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId:
            user.organizationId,
        },
        organization: {
          id: organization.id,
          name: organization.name,
        },
      },
    };
  }

  async login(dto: LoginDto) {
    const user =
      await this.usersService.findByEmail(
        dto.email,
      );

    if (!user) {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    const passwordValid =
      await this.usersService.validatePassword(
        dto.password,
        user.passwordHash,
      );

    if (!passwordValid) {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    const accessToken =
      await this.generateAccessToken(user);

    return {
      success: true,
      data: {
        access_token: accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId:
            user.organizationId,
        },
      },
    };
  }

  async validateUser(userId: string) {
    const user =
      await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User does not exist',
        },
      });
    }

    return user;
  }

  private async generateAccessToken(user: any) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      organizationId:
        user.organizationId,
      role: user.role,
    };

    return this.jwtService.signAsync(
      payload,
    );
  }
}