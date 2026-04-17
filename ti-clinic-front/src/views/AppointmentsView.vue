<template>
  <section class="appointments">
    <div class="header">
      <q-btn
        color="primary"
        unelevated
        icon="add"
        label="Nova consulta"
        @click="isDialogOpen = true"
      />
    </div>

    <q-card flat bordered class="appointments-card">
      <q-card-section class="appointments-header">
        <h2>Consultas agendadas</h2>
      </q-card-section>
      <q-separator />
      <div class="table-scroll table-scroll--wide">
        <q-table
          flat
          :data="appointments"
          :columns="columns"
          row-key="id"
          :loading="isLoadingAppointments"
          no-data-label="Nenhuma consulta agendada."
        >
          <template #body-cell-actions="props">
            <q-td :props="props" class="actions-cell">
              <q-btn
                dense
                flat
                round
                color="primary"
                icon="edit"
                @click="openEditDialog(props.row)"
              />
              <q-btn
                dense
                flat
                round
                color="negative"
                icon="cancel"
                @click="openCancelDialog(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </div>
    </q-card>

    <q-dialog v-model="isDialogOpen" persistent>
      <q-card class="dialog-card">
        <q-card-section class="dialog-header">
          <div class="text-h6">Novo agendamento</div>
          <q-btn dense flat round icon="close" @click="onCloseDialog" />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-form @submit.prevent="onCreateAppointment">
            <div class="form-grid">
              <fieldset class="field-kind">
                <legend class="field-kind-legend">Tipo de atendimento</legend>
                <q-option-group
                  v-model="form.appointmentKind"
                  class="field-kind-options"
                  :options="appointmentKindOptions"
                  color="primary"
                  inline
                  dense
                />
              </fieldset>
              <q-input
                v-model="form.patientCpf"
                outlined
                label="CPF do paciente"
                mask="###.###.###-##"
                unmasked-value
                fill-mask
                lazy-rules
                :rules="[validateRequiredCpf]"
                :loading="isLoadingPatientByCpf"
                @input="onPatientCpfInput"
              />
              <q-input
                :value="form.patientName"
                outlined
                label="Nome do paciente"
                readonly
                :hint="
                  form.patientId
                    ? 'Paciente identificado. Pode continuar o agendamento.'
                    : 'Complete o CPF (11 digitos) para buscar o paciente automaticamente.'
                "
                lazy-rules
                :rules="[validatePatientIdentified]"
              />
              <template v-if="form.patientId">
                <q-checkbox
                  v-if="!patientPlanOptions.length"
                  v-model="form.isPrivatePay"
                  color="primary"
                  dense
                  label="Atendimento particular"
                  @input="onPrivatePayChange"
                />
                <q-select
                  v-if="!form.isPrivatePay && patientPlanOptions.length"
                  v-model="form.patientPlanId"
                  outlined
                  label="Plano do paciente"
                  :options="patientPlanOptions"
                  emit-value
                  map-options
                  option-label="label"
                  option-value="value"
                  lazy-rules
                  :rules="[validatePatientPlanSelection]"
                />
              </template>
              <q-select
                v-if="form.appointmentKind === 'consultation'"
                v-model="form.doctorId"
                outlined
                label="Profissional (com especialidade)"
                :options="doctorOptions"
                emit-value
                map-options
                option-label="label"
                option-value="value"
                lazy-rules
                :rules="[validateRequiredDoctor]"
                @input="onDoctorChange"
              />
              <q-select
                v-if="form.appointmentKind === 'procedure'"
                v-model="form.procedureIds"
                outlined
                label="Procedimentos"
                multiple
                use-chips
                stack-label
                :options="procedureOptions"
                emit-value
                map-options
                option-label="label"
                option-value="value"
                lazy-rules
                :rules="[validateProcedureSelection]"
                :loading="isLoadingProcedures"
                hint="Lista carregada dos procedimentos cadastrados."
              />
              <q-input
                v-model="form.date"
                outlined
                type="date"
                label="Data"
                lazy-rules
                :rules="[validateRequiredDate]"
              />
              <q-input
                v-model="form.time"
                outlined
                type="time"
                label="Hora"
                lazy-rules
                :rules="[validateRequiredTime]"
              />
              <div class="form-actions">
                <q-btn flat label="Cancelar" @click="onCloseDialog" />
                <q-btn
                  type="submit"
                  color="primary"
                  unelevated
                  :loading="isSubmitting"
                  :disable="isSubmitting"
                  label="Salvar"
                />
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="isEditDialogOpen" persistent>
      <q-card class="dialog-card">
        <q-card-section class="dialog-header">
          <div class="text-h6">Editar agendamento</div>
          <q-btn dense flat round icon="close" @click="closeEditDialog" />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-form @submit.prevent="onUpdateAppointment">
            <div class="form-grid">
              <q-input
                :value="editDialogPatientName"
                outlined
                label="Paciente"
                readonly
              />
              <q-input
                :value="editDialogProfessionalLabel"
                outlined
                label="Profissional/Procedimento"
                readonly
              />
              <q-input
                v-model="editForm.date"
                outlined
                type="date"
                label="Data"
                lazy-rules
                :rules="[validateRequiredDate]"
              />
              <q-input
                v-model="editForm.time"
                outlined
                type="time"
                label="Hora"
                lazy-rules
                :rules="[validateRequiredTime]"
              />
              <q-checkbox
                v-model="editForm.isPrivatePay"
                color="primary"
                dense
                label="Atendimento particular"
                :disable="isEditPrivatePayDisabled"
                @input="onEditPrivatePayChange"
              />
              <div
                v-if="isEditPrivatePayDisabled && editForm.isPrivatePay"
                class="private-pay-lock-message"
              >
                Não é possível desmarcar, pois você não tem plano de saúde
                cadastrado.
              </div>
              <q-input
                v-if="!editForm.isPrivatePay && editSelectedPatientPlanLabel"
                :value="editSelectedPatientPlanLabel"
                outlined
                label="Plano do paciente"
                readonly
              />
              <q-select
                v-if="isEditingProcedure"
                v-model="editForm.procedureIds"
                outlined
                label="Procedimentos"
                multiple
                use-chips
                stack-label
                :options="procedureOptions"
                emit-value
                map-options
                option-label="label"
                option-value="value"
                lazy-rules
                :rules="[validateProcedureSelection]"
                :loading="isLoadingProcedures"
              />
              <div class="form-actions">
                <q-btn flat label="Fechar" @click="closeEditDialog" />
                <q-btn
                  type="submit"
                  color="primary"
                  unelevated
                  :loading="isSubmitting"
                  :disable="isSubmitting"
                  label="Salvar alterações"
                />
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="isCancelDialogOpen" persistent>
      <q-card class="cancel-dialog-card">
        <q-card-section>
          <div class="text-h6">Cancelar consulta</div>
          <p>
            Tem certeza que deseja cancelar o agendamento de
            <strong>{{ cancelDialogPatientName }}</strong
            >?
          </p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Voltar" @click="closeCancelDialog" />
          <q-btn
            color="negative"
            unelevated
            label="Cancelar consulta"
            :loading="isSubmitting"
            :disable="isSubmitting"
            @click="onCancelAppointment"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </section>
</template>

<script lang="ts">
import Vue from "vue";

import {
  Appointment as ApiAppointment,
  AppointmentPayload,
  UpdateConsultationPayload,
} from "@/types/consultations";
import { Doctor } from "@/types/doctors";
import {
  createConsultationRequest,
  deleteConsultationRequest,
  getConsultationsRequest,
  updateConsultationRequest,
} from "@/services/consultations/consultations";
import { getPatientByCpfRequest } from "@/services/patients/patient";
import { PatientFromApi } from "@/types/patients";
import { getDoctorsRequest } from "@/services/doctors/doctor";
import { getProceduresRequest } from "@/services/procedures/procedures";
import { Procedure } from "@/types/procedures";

interface AppointmentRow {
  id: string;
  numericId: number;
  kind: AppointmentKind;
  patientName: string;
  patientCpf: string;
  doctorName: string;
  isPrivatePay: boolean;
  procedureIds: string[];
  appointmentDate: string;
  date: string;
  time: string;
}

type AppointmentKind = "consultation" | "procedure";
type SelectOption = { label: string; value: string };
type DoctorOption = SelectOption & { specialtyId: string };

interface AppointmentForm {
  appointmentKind: AppointmentKind;
  patientCpf: string;
  patientId: string;
  patientName: string;
  isPrivatePay: boolean;
  patientPlanId: string;
  doctorId: string;
  specialtyId: string;
  procedureIds: string[];
  date: string;
  time: string;
}

interface AppointmentEditForm {
  date: string;
  time: string;
  isPrivatePay: boolean;
  procedureIds: string[];
}

export default Vue.extend({
  name: "AppointmentsView",
  data(): {
    appointments: AppointmentRow[];
    isDialogOpen: boolean;
    isLoadingAppointments: boolean;
    isSubmitting: boolean;
    isLoadingPatientByCpf: boolean;
    isLoadingProcedures: boolean;
    errorMessage: string;
    isEditDialogOpen: boolean;
    isCancelDialogOpen: boolean;
    appointmentToEdit: AppointmentRow | null;
    appointmentToCancel: AppointmentRow | null;
    editForm: AppointmentEditForm;
    editPatientPlanOptions: SelectOption[];
    editSelectedPatientPlanLabel: string;
    appointmentKindOptions: Array<{
      label: string;
      value: AppointmentKind;
    }>;
    doctorOptions: DoctorOption[];
    procedureOptions: SelectOption[];
    resolvedPatient: PatientFromApi | null;
    form: AppointmentForm;
    columns: Array<{
      name: string;
      label: string;
      field: string;
      align?: "left" | "right" | "center";
      sortable?: boolean;
    }>;
  } {
    return {
      appointments: [],
      isDialogOpen: false,
      isLoadingAppointments: false,
      isSubmitting: false,
      isLoadingPatientByCpf: false,
      isLoadingProcedures: false,
      errorMessage: "",
      isEditDialogOpen: false,
      isCancelDialogOpen: false,
      appointmentToEdit: null,
      appointmentToCancel: null,
      editForm: {
        date: "",
        time: "",
        isPrivatePay: false,
        procedureIds: [],
      },
      editPatientPlanOptions: [],
      editSelectedPatientPlanLabel: "",
      appointmentKindOptions: [
        { label: "Consulta", value: "consultation" },
        { label: "Procedimento", value: "procedure" },
      ],
      doctorOptions: [],
      procedureOptions: [],
      resolvedPatient: null,
      form: {
        appointmentKind: "consultation",
        patientCpf: "",
        patientId: "",
        patientName: "",
        isPrivatePay: false,
        patientPlanId: "",
        doctorId: "",
        specialtyId: "",
        procedureIds: [],
        date: "",
        time: "",
      },
      columns: [
        {
          name: "patientName",
          label: "Paciente",
          field: "patientName",
          align: "left",
          sortable: true,
        },
        {
          name: "doctorName",
          label: "Profissional/Procedimento",
          field: "doctorName",
          align: "left",
          sortable: true,
        },
        {
          name: "date",
          label: "Data",
          field: "date",
          align: "left",
          sortable: true,
        },
        {
          name: "time",
          label: "Hora",
          field: "time",
          align: "left",
          sortable: true,
        },
        {
          name: "actions",
          label: "Ações",
          field: "actions",
          align: "right",
          sortable: false,
        },
      ],
    };
  },
  mounted(): void {
    void this.loadFormOptions();
    void this.loadConsultations();
  },
  computed: {
    patientPlanOptions(): SelectOption[] {
      const patient = this.resolvedPatient;
      if (!patient?.patientPlans?.length) {
        return [];
      }
      return patient.patientPlans.map((plan) => ({
        label: `${plan.healthPlan.description} (${plan.contractNumber})`,
        value: String(plan.id),
      }));
    },
    editDialogPatientName(): string {
      return this.appointmentToEdit?.patientName ?? "-";
    },
    editDialogProfessionalLabel(): string {
      return this.appointmentToEdit?.doctorName ?? "-";
    },
    cancelDialogPatientName(): string {
      return this.appointmentToCancel?.patientName ?? "-";
    },
    isEditingProcedure(): boolean {
      return this.appointmentToEdit?.kind === "procedure";
    },
    isEditPrivatePayDisabled(): boolean {
      return this.editPatientPlanOptions.length === 0;
    },
  },
  watch: {
    "form.appointmentKind"(next: AppointmentKind, previous: AppointmentKind) {
      if (next === previous) {
        return;
      }
      this.form.doctorId = "";
      this.form.specialtyId = "";
      this.form.procedureIds = [];
      if (next === "procedure") {
        void this.loadProcedures();
      }
    },
  },
  methods: {
    validateRequiredCpf(value: string): true | string {
      const digits = String(value ?? "").replace(/\D/g, "");
      if (digits.length !== 11) {
        return "Informe um CPF com 11 digitos.";
      }
      return true;
    },
    validatePatientIdentified(): true | string {
      if (this.form.patientId && this.form.patientName.trim()) {
        return true;
      }
      return "Informe o CPF completo para localizar o paciente.";
    },
    validatePatientPlanSelection(value: string): true | string {
      if (this.form.isPrivatePay) {
        return true;
      }
      return Boolean(value) || "Selecione o plano do paciente.";
    },
    validateRequiredDoctor(value: string): true | string {
      return Boolean(value) || "Informe o profissional.";
    },
    validateProcedureSelection(
      value: string[] | string | null | undefined,
    ): true | string {
      if (this.form.appointmentKind !== "procedure") {
        return true;
      }
      const selected = Array.isArray(value) ? value : [];
      return selected.length > 0 ? true : "Selecione ao menos um procedimento.";
    },
    formatProcedureLabel(procedure: Procedure): string {
      const price = procedure.price?.trim() || "-";
      return `${procedure.name} — R$ ${price}`;
    },
    formatProfessionalName(consultation: ApiAppointment): string {
      const doctorName = consultation.doctor?.name?.trim();
      if (doctorName) {
        return doctorName;
      }

      const procedures = Array.isArray(consultation.procedures)
        ? consultation.procedures
        : [];
      const procedureNames = procedures
        .map((procedure) => procedure.name?.trim())
        .filter((name): name is string => Boolean(name));

      return procedureNames.length ? procedureNames.join(", ") : "-";
    },
    validateRequiredDate(value: string): true | string {
      return Boolean(value) || "Informe a data.";
    },
    validateRequiredTime(value: string): true | string {
      return Boolean(value) || "Informe a hora.";
    },
    formatAppointmentTime(value: string | null | undefined): string {
      if (!value) {
        return "-";
      }
      return value.slice(0, 5);
    },
    formatAppointmentDate(value: string | null | undefined): string {
      if (!value) {
        return "-";
      }
      const parsedDate = new Date(`${value}T00:00:00`);
      if (Number.isNaN(parsedDate.getTime())) {
        return value;
      }
      return parsedDate.toLocaleDateString("pt-BR");
    },
    async loadConsultations(): Promise<void> {
      this.errorMessage = "";
      this.isLoadingAppointments = true;
      try {
        const consultations = await getConsultationsRequest();
        this.appointments = consultations.map(
          (consultation: ApiAppointment) => ({
            id: String(consultation.id),
            numericId: Number(consultation.id),
            kind: consultation.doctor ? "consultation" : "procedure",
            patientName: consultation.patient?.name ?? "-",
            patientCpf: consultation.patient?.cpf ?? "",
            doctorName: this.formatProfessionalName(consultation),
            isPrivatePay: Boolean(consultation.isPrivatePay),
            procedureIds: Array.isArray(consultation.procedures)
              ? consultation.procedures.map((procedure) => String(procedure.id))
              : [],
            appointmentDate: consultation.appointmentDate ?? "",
            date: this.formatAppointmentDate(consultation.appointmentDate),
            time: this.formatAppointmentTime(consultation.appointmentTime),
          }),
        );
      } catch (_error) {
        this.errorMessage =
          "Nao foi possivel carregar as consultas. Tente novamente.";
      } finally {
        this.isLoadingAppointments = false;
      }
    },
    onDoctorChange(selectedDoctorId: string): void {
      const selectedDoctor = this.doctorOptions.find(
        (doctor) => doctor.value === selectedDoctorId,
      );
      this.form.specialtyId = selectedDoctor?.specialtyId ?? "";
    },
    async loadFormOptions(): Promise<void> {
      try {
        const doctors = await getDoctorsRequest();
        this.doctorOptions = doctors.map((doctor: Doctor) => ({
          label: `${doctor.name} - ${
            doctor.specialty?.name ?? "Sem especialidade"
          }`,
          value: String(doctor.id ?? ""),
          specialtyId: String(doctor.specialty?.id ?? ""),
        }));
      } catch (_error) {
        this.errorMessage =
          "Não foi possível carregar os profissionais para o formulário.";
      }
    },
    async loadProcedures(): Promise<void> {
      this.isLoadingProcedures = true;
      try {
        const procedures = await getProceduresRequest();
        this.procedureOptions = procedures.map((procedure: Procedure) => ({
          label: this.formatProcedureLabel(procedure),
          value: String(procedure.id),
        }));
      } catch (_error) {
        this.procedureOptions = [];
        this.showToast(
          "negative",
          "Não foi possível carregar os procedimentos.",
        );
      } finally {
        this.isLoadingProcedures = false;
      }
    },
    onPatientCpfInput(): void {
      const digits = String(this.form.patientCpf ?? "").replace(/\D/g, "");
      this.form.patientId = "";
      this.form.patientName = "";
      this.resolvedPatient = null;
      this.form.isPrivatePay = false;
      this.form.patientPlanId = "";
      if (digits.length === 11) {
        void this.onLookupPatientByCpf(digits);
      }
    },
    onPrivatePayChange(): void {
      this.$nextTick(() => {
        if (this.form.isPrivatePay) {
          this.form.patientPlanId = "";
          return;
        }
        this.applyPatientPlanDefaults(this.resolvedPatient);
      });
    },
    applyPatientPlanDefaults(patient: PatientFromApi | null): void {
      if (!patient) {
        this.form.patientPlanId = "";
        return;
      }
      const plans = patient.patientPlans ?? [];
      if (!plans.length) {
        this.form.isPrivatePay = true;
        this.form.patientPlanId = "";
        return;
      }
      const currentId = patient.currentHealthPlan?.enrollmentId;
      const matched =
        currentId != null
          ? plans.find((plan) => plan.id === currentId)
          : undefined;
      this.form.isPrivatePay = false;
      this.form.patientPlanId = String((matched ?? plans[0]).id);
    },
    showToast(type: "positive" | "negative", message: string): void {
      const quasar = (
        this as Vue & {
          $q?: {
            notify: (payload: { type: string; message: string }) => void;
          };
        }
      ).$q;
      quasar?.notify({
        type,
        message,
      });
    },
    extractErrorMessage(error: unknown, fallback: string): string {
      const requestError = error as {
        response?: { data?: { message?: string } };
      };
      const apiMessage = requestError?.response?.data?.message;
      if (typeof apiMessage === "string" && apiMessage.trim()) {
        return apiMessage;
      }
      return fallback;
    },
    async onLookupPatientByCpf(requestedDigits?: string): Promise<void> {
      const digits =
        requestedDigits ??
        String(this.form.patientCpf ?? "").replace(/\D/g, "");
      if (digits.length !== 11) {
        return;
      }
      this.isLoadingPatientByCpf = true;
      try {
        const patient = await getPatientByCpfRequest(digits);
        const currentDigits = String(this.form.patientCpf ?? "").replace(
          /\D/g,
          "",
        );
        if (currentDigits !== digits) {
          return;
        }
        this.form.patientId = String(patient.id);
        this.form.patientName = (patient.name ?? "").trim();
        this.resolvedPatient = patient;
        this.applyPatientPlanDefaults(patient);
        if (!this.form.patientName) {
          this.showToast(
            "negative",
            "Paciente encontrado, mas sem nome cadastrado.",
          );
        } else {
          this.showToast("positive", "Paciente localizado.");
        }
      } catch (error) {
        const currentDigits = String(this.form.patientCpf ?? "").replace(
          /\D/g,
          "",
        );
        if (currentDigits === digits) {
          this.form.patientId = "";
          this.form.patientName = "";
          this.resolvedPatient = null;
          this.form.isPrivatePay = false;
          this.form.patientPlanId = "";
          this.showToast(
            "negative",
            this.extractErrorMessage(
              error,
              "Nao foi possivel localizar este CPF.",
            ),
          );
        }
      } finally {
        this.isLoadingPatientByCpf = false;
      }
    },
    async onCreateAppointment(): Promise<void> {
      if (
        !this.form.patientId ||
        !this.form.patientName.trim() ||
        !this.form.date ||
        !this.form.time
      ) {
        return;
      }
      if (this.form.appointmentKind === "consultation" && !this.form.doctorId) {
        return;
      }
      if (
        this.form.appointmentKind === "procedure" &&
        !this.form.procedureIds.length
      ) {
        return;
      }
      if (!this.form.isPrivatePay && !this.form.patientPlanId) {
        this.showToast(
          "negative",
          "Selecione o plano do paciente ou marque atendimento particular.",
        );
        return;
      }

      try {
        this.isSubmitting = true;
        const isConsultation = this.form.appointmentKind === "consultation";
        const patientPlanId = this.form.isPrivatePay
          ? 0
          : Number(this.form.patientPlanId);
        const payload: AppointmentPayload = {
          appointmentDate: this.form.date,
          appointmentTime: this.form.time,
          patientId: Number(this.form.patientId),
          doctorId: isConsultation ? Number(this.form.doctorId) : 0,
          specialtyId: isConsultation ? Number(this.form.specialtyId) : 0,
          patientPlanId: Number.isFinite(patientPlanId) ? patientPlanId : 0,
          isPrivatePay: this.form.isPrivatePay,
          procedureIds:
            this.form.appointmentKind === "procedure"
              ? this.form.procedureIds.map((id) => Number(id))
              : [],
        };
        await createConsultationRequest(payload);
        await this.loadConsultations();
        this.onCloseDialog();
      } catch (_error) {
        this.errorMessage = "Nao foi possivel criar a consulta.";
      } finally {
        this.isSubmitting = false;
      }
    },
    openEditDialog(row: AppointmentRow): void {
      this.appointmentToEdit = row;
      this.editForm = {
        date: row.appointmentDate,
        time: row.time,
        isPrivatePay: row.isPrivatePay,
        procedureIds: [...row.procedureIds],
      };
      this.editPatientPlanOptions = [];
      this.editSelectedPatientPlanLabel = "";
      if (row.kind === "procedure" && !this.procedureOptions.length) {
        void this.loadProcedures();
      }
      void this.loadEditPatientPlans(row.patientCpf);
      this.isEditDialogOpen = true;
    },
    async loadEditPatientPlans(patientCpf: string): Promise<void> {
      const normalizedCpf = String(patientCpf ?? "").replace(/\D/g, "");
      if (normalizedCpf.length !== 11) {
        this.editPatientPlanOptions = [];
        this.editSelectedPatientPlanLabel = "";
        this.editForm.isPrivatePay = true;
        return;
      }
      try {
        const patient = await getPatientByCpfRequest(normalizedCpf);
        const options = (patient.patientPlans ?? []).map((plan) => ({
          label: `${plan.healthPlan.description} (${plan.contractNumber})`,
          value: String(plan.id),
        }));
        this.editPatientPlanOptions = options;

        if (!options.length) {
          this.editSelectedPatientPlanLabel = "";
          this.editForm.isPrivatePay = true;
          return;
        }

        const currentId = patient.currentHealthPlan?.enrollmentId;
        const selectedOption =
          (currentId != null
            ? options.find((option) => option.value === String(currentId))
            : undefined) ?? options[0];
        this.editSelectedPatientPlanLabel = selectedOption.label;
      } catch (_error) {
        this.editPatientPlanOptions = [];
        this.editSelectedPatientPlanLabel = "";
        this.editForm.isPrivatePay = true;
      }
    },
    onEditPrivatePayChange(nextValue: boolean): void {
      if (!nextValue && !this.editPatientPlanOptions.length) {
        this.editForm.isPrivatePay = true;
      }
    },
    closeEditDialog(): void {
      this.isEditDialogOpen = false;
      this.appointmentToEdit = null;
      this.editForm = {
        date: "",
        time: "",
        isPrivatePay: false,
        procedureIds: [],
      };
      this.editPatientPlanOptions = [];
      this.editSelectedPatientPlanLabel = "";
    },
    async onUpdateAppointment(): Promise<void> {
      if (!this.appointmentToEdit) {
        return;
      }
      if (!this.editForm.time) {
        return;
      }
      if (!this.editForm.date) {
        return;
      }
      if (
        this.appointmentToEdit.kind === "procedure" &&
        !this.editForm.procedureIds.length
      ) {
        this.showToast("negative", "Selecione ao menos um procedimento.");
        return;
      }

      try {
        this.isSubmitting = true;
        const payload: UpdateConsultationPayload = {
          appointmentDate: this.editForm.date,
          appointmentTime: this.editForm.time,
          isPrivatePay: this.editForm.isPrivatePay,
          procedureIds:
            this.appointmentToEdit.kind === "procedure"
              ? this.editForm.procedureIds.map((id) => Number(id))
              : [],
        };
        await updateConsultationRequest(
          this.appointmentToEdit.numericId,
          payload,
        );
        await this.loadConsultations();
        this.closeEditDialog();
        this.showToast("positive", "Agendamento atualizado com sucesso.");
      } catch (error) {
        this.showToast(
          "negative",
          this.extractErrorMessage(
            error,
            "Nao foi possivel editar a consulta.",
          ),
        );
      } finally {
        this.isSubmitting = false;
      }
    },
    openCancelDialog(row: AppointmentRow): void {
      this.appointmentToCancel = row;
      this.isCancelDialogOpen = true;
    },
    closeCancelDialog(): void {
      this.isCancelDialogOpen = false;
      this.appointmentToCancel = null;
    },
    async onCancelAppointment(): Promise<void> {
      if (!this.appointmentToCancel) {
        return;
      }
      try {
        this.isSubmitting = true;
        await deleteConsultationRequest(this.appointmentToCancel.numericId);
        await this.loadConsultations();
        this.closeCancelDialog();
        this.showToast("positive", "Consulta cancelada com sucesso.");
      } catch (error) {
        this.showToast(
          "negative",
          this.extractErrorMessage(
            error,
            "Nao foi possivel cancelar a consulta.",
          ),
        );
      } finally {
        this.isSubmitting = false;
      }
    },
    onCloseDialog(): void {
      this.isDialogOpen = false;
      this.resolvedPatient = null;
      this.form = {
        appointmentKind: "consultation",
        patientCpf: "",
        patientId: "",
        patientName: "",
        isPrivatePay: false,
        patientPlanId: "",
        doctorId: "",
        specialtyId: "",
        procedureIds: [],
        date: "",
        time: "",
      };
    },
  },
});
</script>

<style lang="scss" scoped>
.appointments {
  width: min(1140px, 90%);
  margin: 0 auto;
  padding: 2rem 1rem 2.5rem;
}

.header {
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  h1 {
    margin: 0;
    font-size: 1.65rem;
    color: #0d3d5c;
  }
}

.appointments-card {
  border-radius: 12px;
  border-color: #d4e5ee;
  background: #fff;
}

.appointments-header h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #0d3d5c;
}

.dialog-card {
  width: min(620px, min(95vw, 100%));
  max-width: 100%;
}

.cancel-dialog-card {
  width: min(360px, 100vw - 2rem);
  max-width: 100%;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-grid {
  display: grid;
  gap: 0.85rem;
}

.field-kind {
  margin: 0;
  padding: 0.65rem 0.75rem 0.75rem;
  border: 1px solid #d4e5ee;
  border-radius: 8px;
  background: #fbfdfe;
}

.field-kind-legend {
  padding: 0 0.35rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: #1a2f3d;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

@media (max-width: 520px) {
  .appointments {
    padding: 1.5rem 0.75rem 2rem;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .field-kind-options::v-deep(> div) {
    display: block;
    width: 100%;
  }
}
</style>
