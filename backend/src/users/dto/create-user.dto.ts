import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from 'src/users/entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    example: 'Petar Petrovic',
    description: 'Full name of the user',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({
    example: 'petar@acme.com',
    description: 'User email address',
  })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'User password',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.EMPLOYEE,
    description: 'Role of the user within the organization',
  })
  @IsEnum(UserRole)
  role!: UserRole;
}