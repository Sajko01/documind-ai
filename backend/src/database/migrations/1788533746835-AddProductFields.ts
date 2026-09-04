import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductFields1788533746835 implements MigrationInterface {
    name = 'AddProductFields1788533746835'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "sku" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ADD "category" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "products" ADD "stock" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "products" ADD "unit" character varying(50) NOT NULL DEFAULT 'piece'`);
        await queryRunner.query(`ALTER TABLE "products" ADD "active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "price" SET NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d05c8848456f1de3e94584a5d9" ON "products"  ("organization_id", "sku") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_d05c8848456f1de3e94584a5d9"`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "price" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "active"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "unit"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "stock"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "sku"`);
    }

}
