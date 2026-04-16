import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhoneToPaciente1744752001000 implements MigrationInterface {
  name = 'AddPhoneToPaciente1744752001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('paciente'))) {
      return;
    }

    const table = await queryRunner.getTable('paciente');
    if (table?.findColumnByName('pac_telefone')) {
      return;
    }

    await queryRunner.query(`
      ALTER TABLE \`paciente\`
      ADD COLUMN \`pac_telefone\` varchar(30) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('paciente'))) {
      return;
    }

    const table = await queryRunner.getTable('paciente');
    if (!table?.findColumnByName('pac_telefone')) {
      return;
    }

    await queryRunner.query(`
      ALTER TABLE \`paciente\`
      DROP COLUMN \`pac_telefone\`
    `);
  }
}
