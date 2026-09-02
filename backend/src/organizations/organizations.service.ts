import { Injectable } from '@nestjs/common';
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
}