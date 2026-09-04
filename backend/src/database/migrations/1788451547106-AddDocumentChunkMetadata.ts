import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDocumentChunkMetadata1788451547106 implements MigrationInterface {
    name = 'AddDocumentChunkMetadata1788451547106'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_b371ff8bc1e4f65fc3d01420be"`);
        await queryRunner.query(`ALTER TABLE "document_chunks" ADD "page_number" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "document_chunks" ADD "token_count" integer NOT NULL`);
        await queryRunner.query(`CREATE INDEX "idx_document_chunks_document_page" ON "document_chunks"  ("document_id", "page_number") `);
        await queryRunner.query(`CREATE INDEX "idx_document_chunks_document_id" ON "document_chunks"  ("document_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_document_chunks_document_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_document_chunks_document_page"`);
        await queryRunner.query(`ALTER TABLE "document_chunks" DROP COLUMN "token_count"`);
        await queryRunner.query(`ALTER TABLE "document_chunks" DROP COLUMN "page_number"`);
        await queryRunner.query(`CREATE INDEX "IDX_b371ff8bc1e4f65fc3d01420be" ON "document_chunks" USING btree ("document_id") `);
    }

}
