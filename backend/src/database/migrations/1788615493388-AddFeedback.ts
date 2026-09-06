import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFeedback1788615493388 implements MigrationInterface {
    name = 'AddFeedback1788615493388'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."feedback_rating_enum" AS ENUM('POSITIVE', 'NEGATIVE')`);
        await queryRunner.query(`CREATE TABLE "feedback" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "message_id" uuid NOT NULL, "user_id" uuid NOT NULL, "rating" "public"."feedback_rating_enum" NOT NULL, "reason" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8389f9e087a57689cd5be8b2b13" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "feedback"`);
        await queryRunner.query(`DROP TYPE "public"."feedback_rating_enum"`);
    }

}
