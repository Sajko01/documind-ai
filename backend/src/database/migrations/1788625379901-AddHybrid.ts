import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHybrid1788625379901 implements MigrationInterface {
    name = 'AddHybrid1788625379901'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_chunks" ADD "search_vector" tsvector`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_chunks" DROP COLUMN "search_vector"`);
    }

}
