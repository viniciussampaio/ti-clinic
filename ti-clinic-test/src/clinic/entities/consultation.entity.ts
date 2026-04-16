import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Doctor } from './doctor.entity';
import { PatientPlan } from './patient-plan.entity';
import { Patient } from './patient.entity';
import { Procedure } from './procedure.entity';

@Entity('consulta')
export class Consultation {
  @PrimaryGeneratedColumn({ name: 'cons_codigo' })
  id: number;

  @Column({ name: 'data', type: 'date' })
  appointmentDate: string;

  @Column({ name: 'hora', type: 'time' })
  appointmentTime: string;

  @Column({ name: 'particular', type: 'tinyint', width: 1, default: 0 })
  isPrivatePay: boolean;

  @ManyToOne(() => Patient, (p) => p.consultations, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'pac_codigo' })
  patient: Patient;

  @ManyToOne(() => Doctor, (d) => d.consultations, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'med_codigo' })
  doctor: Doctor | null;

  @ManyToOne(() => PatientPlan, (pp) => pp.consultations, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'vinculo_codigo' })
  patientPlan: PatientPlan | null;

  @ManyToMany(() => Procedure, (p) => p.consultations)
  @JoinTable({
    name: 'consulta_procedimento',
    joinColumn: {
      name: 'cons_codigo',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'proc_codigo',
      referencedColumnName: 'id',
    },
  })
  procedures: Procedure[];
}
