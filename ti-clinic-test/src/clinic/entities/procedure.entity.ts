import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Consultation } from './consultation.entity';

@Entity('procedimento')
export class Procedure {
  @PrimaryGeneratedColumn({ name: 'proc_codigo' })
  id: number;

  @Column({ name: 'proc_nome', type: 'varchar', length: 255 })
  name: string;

  @Column({
    name: 'proc_valor',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  price: string;

  @ManyToMany(() => Consultation, (c) => c.procedures)
  consultations: Consultation[];
}
