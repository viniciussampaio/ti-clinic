import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Doctor } from './doctor.entity';

@Entity('especialidade')
export class Specialty {
  @PrimaryGeneratedColumn({ name: 'espec_codigp' })
  id: number;

  @Column({ name: 'espec_nome', type: 'varchar', length: 255 })
  name: string;

  @OneToMany(() => Doctor, (d) => d.specialty)
  doctors: Doctor[];
}
