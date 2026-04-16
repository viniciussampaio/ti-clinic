import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowNullDoctorInConsultation1760630400000 implements MigrationInterface {
  name = 'AllowNullDoctorInConsultation1760630400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`consulta\`
      MODIFY COLUMN \`med_codigo\` int NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM \`consulta\`
      WHERE \`med_codigo\` IS NULL
    `);
    await queryRunner.query(`
      ALTER TABLE \`consulta\`
      MODIFY COLUMN \`med_codigo\` int NOT NULL
    `);
  }
}
