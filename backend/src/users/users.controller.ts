import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UserRole } from 'src/users/entities/user.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN) // Samo ADMIN može da dodaje radnike i posmatrače u svoju organizaciju
  @ApiOperation({
    summary: 'Create a new user in the organization (ADMIN only)',
  })
  async create(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const newUser = await this.usersService.createWithPassword(
      dto.name,
      dto.email,
      dto.password,
      user.organizationId, // 🔒 Automatski se dodeljuje ID organizacije ADMIN-a koji pravi zahtev!
      dto.role,
    );

    return {
      success: true,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        organizationId: newUser.organizationId,
      },
    };
  }
}