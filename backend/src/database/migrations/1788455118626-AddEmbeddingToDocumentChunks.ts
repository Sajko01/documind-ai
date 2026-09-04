import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmbeddingToDocumentChunks1788455118626 implements MigrationInterface {
    name = 'AddEmbeddingToDocumentChunks1788455118626'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_chunks" ADD "embedding" vector(384)`);
        await queryRunner.query(`ALTER TABLE "document_chunks" ADD "metadata" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_chunks" DROP COLUMN "metadata"`);
        await queryRunner.query(`ALTER TABLE "document_chunks" DROP COLUMN "embedding"`);
    }

}
