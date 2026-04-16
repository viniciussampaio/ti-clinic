import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCpfToPaciente1744763601000 implements MigrationInterface {
  name = 'AddCpfToPaciente1744763601000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('paciente'))) {
      return;
    }

    const table = await queryRunner.getTable('paciente');
    if (!table?.findColumnByName('pac_cpf')) {
      await queryRunner.query(`
        ALTER TABLE \`paciente\`
        ADD COLUMN \`pac_cpf\` varchar(14) NULL
      `);
    }

    const refreshedTable = await queryRunner.getTable('paciente');
    const hasCpfIndex = refreshedTable?.indices.some(
      (index) => index.name === 'UQ_paciente_pac_cpf',
    );

    if (!hasCpfIndex) {
      await queryRunner.query(`
        CREATE UNIQUE INDEX \`UQ_paciente_pac_cpf\`
        ON \`paciente\` (\`pac_cpf\`)
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('paciente'))) {
      return;
    }

    const table = await queryRunner.getTable('paciente');
    const hasCpfIndex = table?.indices.some(
      (index) => index.name === 'UQ_paciente_pac_cpf',
    );
    if (hasCpfIndex) {
      await queryRunner.query(`DROP INDEX \`UQ_paciente_pac_cpf\` ON \`paciente\``);
    }

    const refreshedTable = await queryRunner.getTable('paciente');
    if (refreshedTable?.findColumnByName('pac_cpf')) {
      await queryRunner.query(`
        ALTER TABLE \`paciente\`
        DROP COLUMN \`pac_cpf\`
      `);
    }
  }
}
