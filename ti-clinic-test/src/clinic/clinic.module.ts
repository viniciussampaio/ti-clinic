import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginModule } from '../login/login.module';
import { Consultation } from './entities/consultation.entity';
import { Doctor } from './entities/doctor.entity';
import { HealthPlan } from './entities/health-plan.entity';
import { PatientPlan } from './entities/patient-plan.entity';
import { Patient } from './entities/patient.entity';
import { Procedure } from './entities/procedure.entity';
import { Specialty } from './entities/specialty.entity';
import { ConsultationsController } from './consultations/consultations.controller';
import { ConsultationsService } from './consultations/consultations.service';
import { DoctorsController } from './doctors/doctors.controller';
import { DoctorsService } from './doctors/doctors.service';
import { HealthPlansController } from './health-plans/health-plans.controller';
import { HealthPlansService } from './health-plans/health-plans.service';
import { PatientPlansController } from './patient-plans/patient-plans.controller';
import { PatientPlansService } from './patient-plans/patient-plans.service';
import { PatientsController } from './patients/patients.controller';
import { PatientsService } from './patients/patients.service';
import { ProceduresController } from './procedures/procedures.controller';
import { ProceduresService } from './procedures/procedures.service';
import { SpecialtiesController } from './specialties/specialties.controller';
import { SpecialtiesService } from './specialties/specialties.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Specialty,
      Doctor,
      Patient,
      HealthPlan,
      PatientPlan,
      Procedure,
      Consultation,
    ]),
    LoginModule,
  ],
  controllers: [
    SpecialtiesController,
    DoctorsController,
    PatientsController,
    HealthPlansController,
    PatientPlansController,
    ProceduresController,
    ConsultationsController,
  ],
  providers: [
    SpecialtiesService,
    DoctorsService,
    PatientsService,
    HealthPlansService,
    PatientPlansService,
    ProceduresService,
    ConsultationsService,
  ],
})
export class ClinicModule {}
