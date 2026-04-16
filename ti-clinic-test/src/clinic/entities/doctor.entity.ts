import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Consultation } from './consultation.entity';
import { Specialty } from './specialty.entity';

@Entity('medico')
export class Doctor {
  @PrimaryGeneratedColumn({ name: 'med_codigo' })
  id: number;

  @Column({ name: 'med_nome', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'med_CRM', type: 'varchar', length: 50 })
  crm: string;

  @ManyToOne(() => Specialty, (s) => s.doctors, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'espec_codigp' })
  specialty: Specialty;

  @OneToMany(() => Consultation, (c) => c.doctor)
  consultations: Consultation[];
}
