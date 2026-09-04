import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDocumentProcessingData1788445909156 implements MigrationInterface {
    name = 'AddDocumentProcessingData1788445909156'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents" ADD "extracted_text" text`);
        await queryRunner.query(`ALTER TABLE "documents" ADD "page_count" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN "page_count"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN "extracted_text"`);
    }

}
