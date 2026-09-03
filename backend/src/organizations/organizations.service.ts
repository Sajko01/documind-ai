import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Organization } from './entities/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationsRepository:
      Repository<Organization>,
  ) {}

  async create(dto: CreateOrganizationDto): Promise<Organization> {
    const organization = this.organizationsRepository.create(dto);

    return this.organizationsRepository.save(organization);
  }


  async findById(
    id: string,
  ): Promise<Organization | null> {
    return this.organizationsRepository.findOne({
      where: { id },
    });
  }

  async findOne(id: string, userOrganizationId: string): Promise<Organization> {
    // 🔒 Security Guard: Korisnik može dohvatiti samo svoju organizaciju
    if (id !== userOrganizationId) {
      throw new ForbiddenException({
        success: false,
        error: {
          code: 'FORBIDDEN_RESOURCE',
          message: 'You do not have permission to access this organization',
        },
      });
    }

    const organization = await this.organizationsRepository.findOne({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'ORGANIZATION_NOT_FOUND',
          message: 'Organization not found',
        },
      });
    }

    return organization;
  }

  async delete(id: string, userOrganizationId: string): Promise<{ success: boolean; message: string }> {
    // 🔒 Security Guard: Admin može obrisati samo svoju organizaciju
    if (id !== userOrganizationId) {
      throw new ForbiddenException({
        success: false,
        error: {
          code: 'FORBIDDEN_RESOURCE',
          message: 'You can only delete your own organization',
        },
      });
    }

    const result = await this.organizationsRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'ORGANIZATION_NOT_FOUND',
          message: 'Organization not found',
        },
      });
    }

    return {
      success: true,
      message: 'Organization successfully deleted',
    };
  }
}