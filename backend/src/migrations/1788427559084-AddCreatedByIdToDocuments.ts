import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatedByIdToDocuments1788427559084 implements MigrationInterface {
    name = 'AddCreatedByIdToDocuments1788427559084'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents" ADD "title" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "documents" ADD "content" text`);
        await queryRunner.query(`ALTER TABLE "documents" ADD "created_by_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "documents" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "filename" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "original_name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "mime_type" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "size" DROP NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_7f46f4f77acde1dcedba64cb22" ON "documents"  ("created_by_id") `);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_7f46f4f77acde1dcedba64cb220" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_7f46f4f77acde1dcedba64cb220"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7f46f4f77acde1dcedba64cb22"`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "size" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "mime_type" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "original_name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "filename" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN "created_by_id"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN "content"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN "title"`);
    }

}
