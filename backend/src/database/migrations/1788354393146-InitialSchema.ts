import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1788354393146 implements MigrationInterface {
    name = 'InitialSchema1788354393146'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."documents_status_enum" AS ENUM('UPLOADED', 'PROCESSING', 'READY', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "filename" character varying(500) NOT NULL, "original_name" character varying(500) NOT NULL, "mime_type" character varying(100) NOT NULL, "size" bigint NOT NULL, "status" "public"."documents_status_enum" NOT NULL DEFAULT 'UPLOADED', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_69427761f37533ae7767601a64b" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_69427761f37533ae7767601a64b"`);
        await queryRunner.query(`DROP TABLE "documents"`);
        await queryRunner.query(`DROP TYPE "public"."documents_status_enum"`);
    }

}
