import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateOfferEntity1788542734802 implements MigrationInterface {
    name = 'UpdateOfferEntity1788542734802'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "offer_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "offer_id" uuid NOT NULL, "product_id" uuid NOT NULL, "productName" character varying(255) NOT NULL, "sku" character varying(100) NOT NULL, "quantity" integer NOT NULL, "unit_price" numeric(12,2) NOT NULL, "subtotal" numeric(12,2) NOT NULL, CONSTRAINT "PK_0b2cba22a72c041326c7b633057" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "offer_number" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "offers" ADD CONSTRAINT "UQ_edc6fae33592fe52f0246b7d342" UNIQUE ("offer_number")`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "customer_name" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "customer_email" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "subtotal" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "total" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "currency" character varying(3) NOT NULL DEFAULT 'EUR'`);
        await queryRunner.query(`CREATE TYPE "public"."offers_status_enum" AS ENUM('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED')`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "status" "public"."offers_status_enum" NOT NULL DEFAULT 'DRAFT'`);
        await queryRunner.query(`ALTER TABLE "offer_items" ADD CONSTRAINT "FK_ff898d1d76f6b2fe3fa64720343" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "offer_items" ADD CONSTRAINT "FK_d1ae04c5ba2be6d06034c913180" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offer_items" DROP CONSTRAINT "FK_d1ae04c5ba2be6d06034c913180"`);
        await queryRunner.query(`ALTER TABLE "offer_items" DROP CONSTRAINT "FK_ff898d1d76f6b2fe3fa64720343"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."offers_status_enum"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "currency"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "total"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "subtotal"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "customer_email"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "customer_name"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP CONSTRAINT "UQ_edc6fae33592fe52f0246b7d342"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "offer_number"`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "price" numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "name" character varying(255) NOT NULL`);
        await queryRunner.query(`DROP TABLE "offer_items"`);
    }

}
