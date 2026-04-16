import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Consultation } from './consultation.entity';
import { PatientPlan } from './patient-plan.entity';

@Entity('paciente')
export class Patient {
  @PrimaryGeneratedColumn({ name: 'pac_codigo' })
  id: number;

  @Column({ name: 'pac_nome', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'pac_cpf', type: 'varchar', length: 14, nullable: true })
  cpf: string | null;

  @Column({ name: 'pac_dataNascimento', type: 'date' })
  birthDate: string;

  @Column({ name: 'pac_telefone', type: 'varchar', length: 30, nullable: true })
  phone: string | null;

  @OneToMany(() => PatientPlan, (pp) => pp.patient)
  patientPlans: PatientPlan[];

  @OneToMany(() => Consultation, (c) => c.patient)
  consultations: Consultation[];
}
