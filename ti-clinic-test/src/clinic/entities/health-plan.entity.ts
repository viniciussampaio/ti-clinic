import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PatientPlan } from './patient-plan.entity';

@Entity('plano_saucede')
export class HealthPlan {
  @PrimaryGeneratedColumn({ name: 'plan_codig' })
  id: number;

  @Column({ name: 'plano_descricao', type: 'varchar', length: 255 })
  description: string;

  @Column({ name: 'plano_telefone', type: 'varchar', length: 30 })
  phone: string;

  @OneToMany(() => PatientPlan, (pp) => pp.healthPlan)
  patientPlans: PatientPlan[];
}
