import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1788356035860 implements MigrationInterface {
    name = 'InitialSchema1788356035860'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "conversations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "user_id" uuid NOT NULL, "title" character varying(255), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ee34f4f7ced4ec8681f26bf04ef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "description" text, "price" numeric(12,2), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "offers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "description" text, "price" numeric(12,2), "validUntil" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4c88e956195bba85977da21b8f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "analytics_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "user_id" uuid, "event" character varying(100) NOT NULL, "metadata" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5d643d67a09b55653e98616f421" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "document_chunks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "document_id" uuid NOT NULL, "chunk_index" integer NOT NULL, "content" text NOT NULL, CONSTRAINT "PK_7f9060084e9b872dbb567193978" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."messages_role_enum" AS ENUM('USER', 'ASSISTANT', 'SYSTEM')`);
        await queryRunner.query(`CREATE TABLE "messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "conversation_id" uuid NOT NULL, "role" "public"."messages_role_enum" NOT NULL, "content" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "conversations" ADD CONSTRAINT "FK_87d9df8c99fb824a39c681ec332" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversations" ADD CONSTRAINT "FK_3a9ae579e61e81cc0e989afeb4a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_2d404aa7aa4a0404eafd1840915" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "offers" ADD CONSTRAINT "FK_efca5c2e908392eab0c3b3c3e50" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "analytics_events" ADD CONSTRAINT "FK_dedf1e7bd95f57cf6fa6687ab4d" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "analytics_events" ADD CONSTRAINT "FK_c49704abb1730ae4121d5ac9f5e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document_chunks" ADD CONSTRAINT "FK_b371ff8bc1e4f65fc3d01420be5" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_3bc55a7c3f9ed54b520bb5cfe23" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_3bc55a7c3f9ed54b520bb5cfe23"`);
        await queryRunner.query(`ALTER TABLE "document_chunks" DROP CONSTRAINT "FK_b371ff8bc1e4f65fc3d01420be5"`);
        await queryRunner.query(`ALTER TABLE "analytics_events" DROP CONSTRAINT "FK_c49704abb1730ae4121d5ac9f5e"`);
        await queryRunner.query(`ALTER TABLE "analytics_events" DROP CONSTRAINT "FK_dedf1e7bd95f57cf6fa6687ab4d"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP CONSTRAINT "FK_efca5c2e908392eab0c3b3c3e50"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_2d404aa7aa4a0404eafd1840915"`);
        await queryRunner.query(`ALTER TABLE "conversations" DROP CONSTRAINT "FK_3a9ae579e61e81cc0e989afeb4a"`);
        await queryRunner.query(`ALTER TABLE "conversations" DROP CONSTRAINT "FK_87d9df8c99fb824a39c681ec332"`);
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TYPE "public"."messages_role_enum"`);
        await queryRunner.query(`DROP TABLE "document_chunks"`);
        await queryRunner.query(`DROP TABLE "analytics_events"`);
        await queryRunner.query(`DROP TABLE "offers"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TABLE "conversations"`);
    }

}
