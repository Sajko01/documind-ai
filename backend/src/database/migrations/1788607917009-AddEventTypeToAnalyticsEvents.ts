import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEventTypeToAnalyticsEvents1788607917009 implements MigrationInterface {
    name = 'AddEventTypeToAnalyticsEvents1788607917009'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "analytics_events" DROP CONSTRAINT "FK_dedf1e7bd95f57cf6fa6687ab4d"`);
        await queryRunner.query(`ALTER TABLE "analytics_events" DROP CONSTRAINT "FK_c49704abb1730ae4121d5ac9f5e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dedf1e7bd95f57cf6fa6687ab4"`);
        await queryRunner.query(`ALTER TABLE "analytics_events" DROP COLUMN "event"`);
        await queryRunner.query(`ALTER TABLE "analytics_events" ADD "event_type" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "analytics_events" ADD "document_id" uuid`);
        await queryRunner.query(`ALTER TABLE "analytics_events" ADD "conversation_id" uuid`);
        await queryRunner.query(`ALTER TABLE "analytics_events" ADD "response_time_ms" integer`);
        await queryRunner.query(`ALTER TABLE "analytics_events" ADD "retrieval_score" double precision`);
        await queryRunner.query(`ALTER TABLE "offer_items" DROP CONSTRAINT "FK_ff898d1d76f6b2fe3fa64720343"`);
        await queryRunner.query(`ALTER TABLE "offer_items" ALTER COLUMN "offer_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "offer_items" ADD CONSTRAINT "FK_ff898d1d76f6b2fe3fa64720343" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offer_items" DROP CONSTRAINT "FK_ff898d1d76f6b2fe3fa64720343"`);
        await queryRunner.query(`ALTER TABLE "offer_items" ALTER COLUMN "offer_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "offer_items" ADD CONSTRAINT "FK_ff898d1d76f6b2fe3fa64720343" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "analytics_events" DROP COLUMN "retrieval_score"`);
        await queryRunner.query(`ALTER TABLE "analytics_events" DROP COLUMN "response_time_ms"`);
        await queryRunner.query(`ALTER TABLE "analytics_events" DROP COLUMN "conversation_id"`);
        await queryRunner.query(`ALTER TABLE "analytics_events" DROP COLUMN "document_id"`);
        await queryRunner.query(`ALTER TABLE "analytics_events" DROP COLUMN "event_type"`);
        await queryRunner.query(`ALTER TABLE "analytics_events" ADD "event" character varying(100) NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_dedf1e7bd95f57cf6fa6687ab4" ON "analytics_events" USING btree ("organization_id") `);
        await queryRunner.query(`ALTER TABLE "analytics_events" ADD CONSTRAINT "FK_c49704abb1730ae4121d5ac9f5e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "analytics_events" ADD CONSTRAINT "FK_dedf1e7bd95f57cf6fa6687ab4d" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
