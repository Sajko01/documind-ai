import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMultiTenantRoles1788423548565 implements MigrationInterface {
    name = 'AddMultiTenantRoles1788423548565'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'EMPLOYEE', 'VIEWER')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::"text"::"public"."users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'EMPLOYEE'`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum_old"`);
        await queryRunner.query(`CREATE INDEX "IDX_69427761f37533ae7767601a64" ON "documents"  ("organization_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_21a659804ed7bf61eb91688dea" ON "users"  ("organization_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_87d9df8c99fb824a39c681ec33" ON "conversations"  ("organization_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_2d404aa7aa4a0404eafd184091" ON "products"  ("organization_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_efca5c2e908392eab0c3b3c3e5" ON "offers"  ("organization_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_dedf1e7bd95f57cf6fa6687ab4" ON "analytics_events"  ("organization_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_b371ff8bc1e4f65fc3d01420be" ON "document_chunks"  ("document_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_8584a1974e1ca95f4861d975ff" ON "messages"  ("conversation_id", "created_at") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_8584a1974e1ca95f4861d975ff"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b371ff8bc1e4f65fc3d01420be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dedf1e7bd95f57cf6fa6687ab4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_efca5c2e908392eab0c3b3c3e5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2d404aa7aa4a0404eafd184091"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_87d9df8c99fb824a39c681ec33"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_21a659804ed7bf61eb91688dea"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_69427761f37533ae7767601a64"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum_old" AS ENUM('ADMIN', 'MEMBER')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum_old" USING "role"::"text"::"public"."users_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'MEMBER'`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum_old" RENAME TO "users_role_enum"`);
    }

}
