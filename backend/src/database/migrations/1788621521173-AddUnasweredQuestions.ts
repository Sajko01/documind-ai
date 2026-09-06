import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUnasweredQuestions1788621521173 implements MigrationInterface {
    name = 'AddUnasweredQuestions1788621521173'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."unanswered_questions_status_enum" AS ENUM('OPEN', 'REVIEWED', 'RESOLVED')`);
        await queryRunner.query(`CREATE TABLE "unanswered_questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "user_id" uuid NOT NULL, "conversation_id" uuid, "message_id" uuid, "question" text NOT NULL, "confidence" double precision, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."unanswered_questions_status_enum" NOT NULL DEFAULT 'OPEN', CONSTRAINT "PK_f7e1c8a4b4e110d43bd839b1212" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9e9aee9517d82f26c11dd9af7b" ON "unanswered_questions"  ("organization_id", "created_at") `);
        await queryRunner.query(`ALTER TABLE "messages" ADD "confidence" double precision`);
        await queryRunner.query(`ALTER TABLE "messages" ADD "answered" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c28c7d3706bcf46c2ee29ccc77" ON "feedback"  ("message_id", "user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_fbc05de7846085e680a8a2d4f4" ON "feedback"  ("organization_id", "created_at") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_fbc05de7846085e680a8a2d4f4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c28c7d3706bcf46c2ee29ccc77"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "answered"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "confidence"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9e9aee9517d82f26c11dd9af7b"`);
        await queryRunner.query(`DROP TABLE "unanswered_questions"`);
        await queryRunner.query(`DROP TYPE "public"."unanswered_questions_status_enum"`);
    }

}
