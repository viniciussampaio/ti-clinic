import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedClinicData1744636802000 implements MigrationInterface {
  name = 'SeedClinicData1744636802000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO \`especialidade\` (\`espec_codigp\`, \`espec_nome\`) VALUES
        (1, 'General Practice'),
        (2, 'Cardiology'),
        (3, 'Dermatology')
    `);

    await queryRunner.query(`
      INSERT INTO \`medico\` (\`med_codigo\`, \`med_nome\`, \`med_CRM\`, \`espec_codigp\`) VALUES
        (1, 'Dr. Jane Martins', 'CRM-SP 123456', 1),
        (2, 'Dr. John Costa', 'CRM-SP 234567', 2),
        (3, 'Dr. Carol Dias', 'CRM-SP 345678', 3)
    `);

    await queryRunner.query(`
      INSERT INTO \`paciente\` (\`pac_codigo\`, \`pac_nome\`, \`pac_dataNascimento\`) VALUES
        (1, 'James Silva', '1988-03-15'),
        (2, 'Mary Oliveira', '1995-07-22'),
        (3, 'Peter Santos', '1979-11-01')
    `);

    await queryRunner.query(`
      INSERT INTO \`paciente_telefones\` (\`id\`, \`pac_codigo\`, \`telefone\`) VALUES
        (1, 1, '+1 555-111-1001'),
        (2, 1, '+1 555-111-1002'),
        (3, 2, '+1 555-222-2001'),
        (4, 3, '+1 555-333-3001')
    `);

    await queryRunner.query(`
      INSERT INTO \`plano_saucede\` (\`plan_codig\`, \`plano_descricao\`, \`plano_telefone\`) VALUES
        (1, 'Basic Health Plan', '1-800-100-1000'),
        (2, 'Premium Health Plan', '1-800-200-2000')
    `);

    await queryRunner.query(`
      INSERT INTO \`vinculo\` (\`vinculo_codigo\`, \`pac_codigo\`, \`plan_codig\`, \`nr_contrato\`) VALUES
        (1, 1, 1, 'CTR-2024-0001'),
        (2, 2, 2, 'CTR-2024-0002'),
        (3, 3, 1, 'CTR-2024-0003')
    `);

    await queryRunner.query(`
      INSERT INTO \`procedimento\` (\`proc_codigo\`, \`proc_nome\`, \`proc_valor\`) VALUES
        (1, 'Routine consultation', 150.00),
        (2, 'Electrocardiogram', 80.00),
        (3, 'Dermatology exam', 200.00)
    `);

    await queryRunner.query(`
      INSERT INTO \`consulta\` (\`cons_codigo\`, \`data\`, \`hora\`, \`particular\`, \`pac_codigo\`, \`med_codigo\`, \`vinculo_codigo\`) VALUES
        (1, '2026-04-10', '09:00:00', 0, 1, 1, 1),
        (2, '2026-04-11', '14:30:00', 1, 2, 2, NULL),
        (3, '2026-04-12', '10:15:00', 0, 3, 3, 3)
    `);

    await queryRunner.query(`
      INSERT INTO \`consulta_procedimento\` (\`cons_codigo\`, \`proc_codigo\`) VALUES
        (1, 1),
        (2, 1),
        (2, 2),
        (3, 1),
        (3, 3)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM \`consulta_procedimento\``);
    await queryRunner.query(`DELETE FROM \`consulta\``);
    await queryRunner.query(`DELETE FROM \`vinculo\``);
    await queryRunner.query(`DELETE FROM \`procedimento\``);
    await queryRunner.query(`DELETE FROM \`plano_saucede\``);
    await queryRunner.query(`DELETE FROM \`paciente_telefones\``);
    await queryRunner.query(`DELETE FROM \`paciente\``);
    await queryRunner.query(`DELETE FROM \`medico\``);
    await queryRunner.query(`DELETE FROM \`especialidade\``);
  }
}
