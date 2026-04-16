import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedFakePatients1744760001000 implements MigrationInterface {
  name = 'SeedFakePatients1744760001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO \`paciente\` (\`pac_nome\`, \`pac_dataNascimento\`, \`pac_telefone\`) VALUES
        ('Paciente Fake 01 - Lucas Almeida', '1991-02-14', '21990000001'),
        ('Paciente Fake 02 - Marina Souza', '1987-06-30', '21990000002'),
        ('Paciente Fake 03 - Rafael Costa', '1995-11-09', '21990000003'),
        ('Paciente Fake 04 - Juliana Lima', '1978-04-21', '21990000004'),
        ('Paciente Fake 05 - Bruno Nogueira', '2000-01-03', '21990000005'),
        ('Paciente Fake 06 - Camila Rocha', '1983-09-17', '21990000006'),
        ('Paciente Fake 07 - Thiago Martins', '1998-12-25', '21990000007'),
        ('Paciente Fake 08 - Fernanda Ribeiro', '1993-07-08', '21990000008'),
        ('Paciente Fake 09 - Diego Melo', '1989-05-12', '21990000009'),
        ('Paciente Fake 10 - Patricia Barros', '1975-10-29', '21990000010')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM \`paciente\`
      WHERE \`pac_nome\` IN (
        'Paciente Fake 01 - Lucas Almeida',
        'Paciente Fake 02 - Marina Souza',
        'Paciente Fake 03 - Rafael Costa',
        'Paciente Fake 04 - Juliana Lima',
        'Paciente Fake 05 - Bruno Nogueira',
        'Paciente Fake 06 - Camila Rocha',
        'Paciente Fake 07 - Thiago Martins',
        'Paciente Fake 08 - Fernanda Ribeiro',
        'Paciente Fake 09 - Diego Melo',
        'Paciente Fake 10 - Patricia Barros'
      )
    `);
  }
}
