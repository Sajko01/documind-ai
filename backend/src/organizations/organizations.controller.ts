

import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

// import { CreateOrganizationDto } from './dto/create-organization.dto';

// @Controller('organizations')
// export class OrganizationsController {
//   @Post()
//   create(@Body() dto: CreateOrganizationDto) {
//     return {
//       message: 'Organization created',
//       data: dto,
//     };
//   }
// }
import { OrganizationsService } from './organizations.service';

import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationsController {
    constructor(private readonly organizationsService: OrganizationsService) {}

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
  create(
    @Body() dto: CreateOrganizationDto,
  ) {
    return this.organizationsService.create(dto);
  }
}