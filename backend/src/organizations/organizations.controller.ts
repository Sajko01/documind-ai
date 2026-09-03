

// import {
//   Body,
//   Controller,
//   Delete,
//   Get,
//   Param,
//   Post,
//   UseGuards,
// } from '@nestjs/common';

// // import { CreateOrganizationDto } from './dto/create-organization.dto';

// // @Controller('organizations')
// // export class OrganizationsController {
// //   @Post()
// //   create(@Body() dto: CreateOrganizationDto) {
// //     return {
// //       message: 'Organization created',
// //       data: dto,
// //     };
// //   }
// // }
// import { OrganizationsService } from './organizations.service';

// import {
//   ApiOperation,
//   ApiResponse,
//   ApiTags,
// } from '@nestjs/swagger';
// import { CreateOrganizationDto } from './dto/create-organization.dto';
// import { Roles } from 'src/auth/decorators/roles.decorator';
// import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// import { RolesGuard } from 'src/auth/guards/roles.guard';
// import { UserRole } from 'src/users/entities/user.entity';
// import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

// @ApiTags('organizations')
// @Controller('organizations')
// export class OrganizationsController {
//     constructor(private readonly organizationsService: OrganizationsService) {}

//   @Post()
//   @ApiOperation({
//     summary: 'Create organization',
//   })
//   @ApiResponse({
//     status: 201,
//     description: 'Organization successfully created',
//   })
//   @ApiResponse({
//     status: 400,
//     description: 'Invalid request',
//   })
//   create(
//     @Body() dto: CreateOrganizationDto,
//   ) {
//     return this.organizationsService.create(dto);
//   }

//   @Get('admin-test')
// @UseGuards(
//   JwtAuthGuard,
//   RolesGuard,
// )
// @Roles(UserRole.ADMIN)
// adminTest(
//   @CurrentUser() user: JwtPayload,
// ) {
//   return {
//     success: true,
//     message: 'Admin access granted',
//     organizationId:
//       user.organizationId,
//     userId: user.userId,
//   };
// }

// @Post()
// @UseGuards(
//   JwtAuthGuard,
//   RolesGuard,
// )
// @Roles(
//   UserRole.ADMIN,
//   UserRole.EMPLOYEE,
// )
// create(
//   @CurrentUser() user: JwtPayload,
// ) {
//   return {
//     organizationId:
//       user.organizationId,
//   };
// }

// @Get()
// @UseGuards(JwtAuthGuard)
// findAll(
//   @CurrentUser() user: JwtPayload,
// ) {
//   return this.documentsService.findAll(
//     user.organizationId,
//   );
// }

// @Delete(':id')
// @UseGuards(
//   JwtAuthGuard,
//   RolesGuard,
// )
// @Roles(UserRole.ADMIN)
// delete(
//   @Param('id') id: string,
//   @CurrentUser() user: JwtPayload,
// ) {
//   return this.documentsService.delete(
//     id,
//     user.organizationId,
//   );
// }
// }

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/users/entities/user.entity';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationsService } from './organizations.service';

@ApiTags('organizations')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create organization',
  })
  @ApiResponse({
    status: 201,
    description: 'Organization successfully created',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request',
  })
  create(@Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(dto);
  }

  @Get('admin-test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Test admin access for organization',
  })
  adminTest(@CurrentUser() user: JwtPayload) {
    return {
      success: true,
      message: 'Admin access granted',
      organizationId: user.organizationId,
      userId: user.sub, // Popravljeno: koristimo sub umesto userId
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get organization details',
  })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.organizationsService.findOne(id, user.organizationId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Delete organization',
  })
  delete(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.organizationsService.delete(id, user.organizationId);
  }
}