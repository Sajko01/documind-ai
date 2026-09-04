import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSourcesToMessages1788523183671 implements MigrationInterface {
    name = 'AddSourcesToMessages1788523183671'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" ADD "sources" jsonb`);
        await queryRunner.query(`ALTER TYPE "public"."messages_role_enum" RENAME TO "messages_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."messages_role_enum" AS ENUM('user', 'assistant', 'system')`);
        await queryRunner.query(`ALTER TABLE "messages" ALTER COLUMN "role" TYPE "public"."messages_role_enum" USING "role"::"text"::"public"."messages_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."messages_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "conversations" ALTER COLUMN "title" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_3a9ae579e61e81cc0e989afeb4" ON "conversations"  ("user_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_3a9ae579e61e81cc0e989afeb4"`);
        await queryRunner.query(`ALTER TABLE "conversations" ALTER COLUMN "title" DROP NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."messages_role_enum_old" AS ENUM('USER', 'ASSISTANT', 'SYSTEM')`);
        await queryRunner.query(`ALTER TABLE "messages" ALTER COLUMN "role" TYPE "public"."messages_role_enum_old" USING "role"::"text"::"public"."messages_role_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."messages_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."messages_role_enum_old" RENAME TO "messages_role_enum"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "sources"`);
    }

}
