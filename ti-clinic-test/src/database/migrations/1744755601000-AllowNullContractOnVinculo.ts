import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowNullContractOnVinculo1744755601000
  implements MigrationInterface
{
  name = 'AllowNullContractOnVinculo1744755601000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('vinculo'))) {
      return;
    }

    const table = await queryRunner.getTable('vinculo');
    if (!table?.findColumnByName('nr_contrato')) {
      return;
    }

    await queryRunner.query(`
      ALTER TABLE \`vinculo\`
      MODIFY COLUMN \`nr_contrato\` varchar(100) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('vinculo'))) {
      return;
    }

    const table = await queryRunner.getTable('vinculo');
    if (!table?.findColumnByName('nr_contrato')) {
      return;
    }

    await queryRunner.query(`
      UPDATE \`vinculo\`
      SET \`nr_contrato\` = ''
      WHERE \`nr_contrato\` IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE \`vinculo\`
      MODIFY COLUMN \`nr_contrato\` varchar(100) NOT NULL
    `);
  }
}
