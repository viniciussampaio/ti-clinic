import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Consultation } from './consultation.entity';
import { HealthPlan } from './health-plan.entity';
import { Patient } from './patient.entity';

@Entity('vinculo')
export class PatientPlan {
  @PrimaryGeneratedColumn({ name: 'vinculo_codigo' })
  id: number;

  @ManyToOne(() => Patient, (p) => p.patientPlans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pac_codigo' })
  patient: Patient;

  @ManyToOne(() => HealthPlan, (h) => h.patientPlans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_codig' })
  healthPlan: HealthPlan;

  @Column({ name: 'nr_contrato', type: 'varchar', length: 100, nullable: true })
  contractNumber: string | null;

  @OneToMany(() => Consultation, (c) => c.patientPlan)
  consultations: Consultation[];
}
