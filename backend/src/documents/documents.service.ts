import { Injectable } from '@nestjs/common';



import {Logger } from '@nestjs/common';

@Injectable()
export class DocumentsService {
  private readonly logger =
    new Logger(DocumentsService.name);

  findAll() {
    this.logger.log('Fetching documents');

    // ...
  }
}