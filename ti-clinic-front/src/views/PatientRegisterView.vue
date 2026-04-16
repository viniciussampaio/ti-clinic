<template>
  <section class="patient-register">
    <div class="header">
      <div>
        <h1>Pacientes</h1>
      </div>
      <q-btn
        color="primary"
        unelevated
        dense
        icon="add"
        label="Novo paciente"
        class="new-patient-btn"
        @click="openCreateDialog"
      />
    </div>

    <q-card flat bordered class="list-card">
      <q-card-section class="list-header">
        <h2>Pacientes cadastrados</h2>
        <q-input
          v-model.trim="searchTerm"
          dense
          outlined
          clearable
          class="search-input"
          placeholder="Buscar por nome ou telefone"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-card-section>

      <q-separator />

      <q-table
        flat
        :data="filteredPatients"
        :columns="tableColumns"
        row-key="id"
        :loading="isLoadingPatients"
        no-data-label="Nenhum paciente cadastrado."
      >
        <template #body-cell-birthDate="props">
          <q-td :props="props">
            {{ formatBirthDate(props.row.birthDate) }}
          </q-td>
        </template>

        <template #body-cell-phone="props">
          <q-td :props="props">
            {{ formatPhone(props.row.phone) }}
          </q-td>
        </template>

        <template #body-cell-cpf="props">
          <q-td :props="props">
            {{ formatCpf(props.row.cpf) }}
          </q-td>
        </template>

        <template #body-cell-patientPlans="props">
          <q-td :props="props">
            {{ formatPatientPlans(props.row.patientPlans) }}
          </q-td>
        </template>

        <template #body-cell-currentHealthPlan="props">
          <q-td :props="props">
            {{ formatCurrentHealthPlan(props.row.currentHealthPlan) }}
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">
            <div class="actions-cell">
              <q-btn
                dense
                flat
                round
                color="primary"
                icon="edit"
                @click="startEdit(props.row)"
              />
              <q-btn
                dense
                flat
                round
                color="negative"
                icon="delete"
                @click="openDeleteDialog(props.row)"
              />
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="isFormDialogOpen" persistent>
      <q-card class="form-dialog">
        <q-card-section class="form-dialog-header">
          <div class="text-h6">
            {{ isEditing ? "Editar paciente" : "Cadastrar paciente" }}
          </div>
          <q-btn dense flat round icon="close" @click="closeFormDialog" />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-form
            ref="patientForm"
            class="form-grid"
            @submit.prevent="onSubmit"
          >
            <q-input
              v-model.trim="form.name"
              outlined
              label="Nome"
              placeholder="Digite o nome do paciente"
              autocomplete="name"
              :disable="isSubmitting"
              lazy-rules
              :rules="[validateRequiredName]"
            />

            <q-input
              v-model.trim="form.cpf"
              outlined
              label="CPF"
              placeholder="000.000.000-00"
              mask="###.###.###-##"
              :disable="isSubmitting"
              lazy-rules
              :rules="[validateRequiredCpf]"
            />

            <q-input
              v-model="form.birthDate"
              outlined
              type="date"
              label="Data de aniversario"
              :max="today"
              :disable="isSubmitting"
              lazy-rules
              :rules="[validateRequiredBirthDate]"
            />

            <q-input
              v-model.trim="form.phone"
              outlined
              type="tel"
              label="Telefone"
              placeholder="(00) 00000-0000"
              autocomplete="tel"
              :disable="isSubmitting"
              mask="(##) #####-####"
              lazy-rules
              :rules="[validateRequiredPhone]"
            />

            <q-select
              v-model="form.healthPlanId"
              outlined
              clearable
              emit-value
              map-options
              label="Plano de saude"
              :options="healthPlanOptions"
              :loading="isLoadingHealthPlans"
              :disable="isSubmitting || isLoadingHealthPlans"
              option-label="label"
              option-value="value"
            />

            <q-input
              v-if="hasSelectedHealthPlan"
              v-model.trim="form.contractNumber"
              outlined
              label="Numero do contrato"
              placeholder="Ex.: CTR-2026-003 (opcional)"
              :disable="isSubmitting"
            />

            <q-banner
              v-if="errorMessage"
              dense
              inline-actions
              class="feedback error"
            >
              {{ errorMessage }}
            </q-banner>
            <q-banner
              v-if="successMessage"
              dense
              inline-actions
              class="feedback success"
            >
              {{ successMessage }}
            </q-banner>

            <div class="form-actions">
              <q-btn flat label="Cancelar" @click="closeFormDialog" />
              <q-btn
                type="submit"
                color="primary"
                unelevated
                class="submit-btn"
                :loading="isSubmitting"
                :disable="isSubmitting"
                :label="isEditing ? 'Salvar alterações' : 'Cadastrar paciente'"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="isDeleteDialogOpen" persistent>
      <q-card class="delete-dialog">
        <q-card-section>
          <div class="text-h6">Excluir paciente</div>
          <p>
            Tem certeza que deseja excluir
            <strong>{{ deletePatientName }}</strong
            >?
          </p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="closeDeleteDialog" />
          <q-btn
            color="negative"
            unelevated
            label="Excluir"
            @click="onDelete"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </section>
</template>

<script lang="ts">
import Vue from "vue";
import {
  CurrentHealthPlan,
  PatientForm as PatientPayload,
  PatientPlan,
  RegisteredPatient,
} from "@/types/patients";
import { getHealthPlansRequest } from "@/services/health-plans/healthPlans";
import { HealthPlan } from "@/types/health-plans";
import {
  deletePatientRequest,
  getPatientsRequest,
  registerPatientRequest,
  updatePatientRequest,
} from "@/services/patients/patient";

interface PatientFormState {
  name: string;
  cpf: string;
  phone: string;
  birthDate: string;
  healthPlanId: number | null;
  contractNumber: string;
}

export default Vue.extend({
  name: "PatientRegisterView",
  data(): {
    form: PatientFormState;
    errorMessage: string;
    successMessage: string;
    registeredPatients: RegisteredPatient[];
    today: string;
    isSubmitting: boolean;
    isLoadingPatients: boolean;
    isLoadingHealthPlans: boolean;
    isFormDialogOpen: boolean;
    editingPatientId: string | null;
    searchTerm: string;
    healthPlans: HealthPlan[];
    isDeleteDialogOpen: boolean;
    patientToDelete: RegisteredPatient | null;
    tableColumns: Array<{
      name: string;
      label: string;
      field: string;
      align?: "left" | "right" | "center";
      sortable?: boolean;
    }>;
  } {
    return {
      form: {
        name: "",
        cpf: "",
        phone: "",
        birthDate: "",
        healthPlanId: null,
        contractNumber: "",
      },
      errorMessage: "",
      successMessage: "",
      registeredPatients: [],
      today: new Date().toISOString().split("T")[0],
      isSubmitting: false,
      isLoadingPatients: false,
      isLoadingHealthPlans: false,
      isFormDialogOpen: false,
      editingPatientId: null,
      searchTerm: "",
      healthPlans: [],
      isDeleteDialogOpen: false,
      patientToDelete: null,
      tableColumns: [
        {
          name: "name",
          label: "Nome",
          field: "name",
          align: "left",
          sortable: true,
        },
        {
          name: "cpf",
          label: "CPF",
          field: "cpf",
          align: "left",
          sortable: true,
        },
        {
          name: "birthDate",
          label: "Data de aniversario",
          field: "birthDate",
          align: "left",
          sortable: true,
        },
        {
          name: "phone",
          label: "Telefone",
          field: "phone",
          align: "left",
          sortable: false,
        },
        {
          name: "patientPlans",
          label: "Planos",
          field: "patientPlans",
          align: "left",
          sortable: false,
        },
        {
          name: "currentHealthPlan",
          label: "Plano atual",
          field: "currentHealthPlan",
          align: "left",
          sortable: false,
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
    void this.loadPatients();
    void this.loadHealthPlans();
  },
  computed: {
    isEditing(): boolean {
      return Boolean(this.editingPatientId);
    },
    deletePatientName(): string {
      return this.patientToDelete?.name?.trim() || "-";
    },
    filteredPatients(): RegisteredPatient[] {
      const normalizedTerm = this.searchTerm.trim().toLowerCase();
      if (!normalizedTerm) {
        return this.registeredPatients;
      }
      return this.registeredPatients.filter((patient) => {
        const normalizedName = patient.name.toLowerCase();
        const normalizedPhone = this.formatPhone(patient.phone).toLowerCase();
        const normalizedCpf = this.formatCpf(patient.cpf).toLowerCase();
        return (
          normalizedName.includes(normalizedTerm) ||
          normalizedPhone.includes(normalizedTerm) ||
          normalizedCpf.includes(normalizedTerm)
        );
      });
    },
    healthPlanOptions(): Array<{ label: string; value: number }> {
      return this.healthPlans.map((plan) => ({
        label: plan.description,
        value: Number(plan.id),
      }));
    },
    hasSelectedHealthPlan(): boolean {
      return this.form.healthPlanId !== null;
    },
  },
  methods: {
    validateRequiredName(value: string): true | string {
      return Boolean(value) || "Informe o nome do paciente.";
    },
    validateRequiredCpf(value: string): true | string {
      return Boolean(value) || "Informe o CPF.";
    },
    validateRequiredBirthDate(value: string): true | string {
      return Boolean(value) || "Informe a data de aniversario.";
    },
    validateRequiredPhone(value: string): true | string {
      return Boolean(value) || "Informe o telefone.";
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
    async loadPatients(): Promise<void> {
      this.errorMessage = "";
      this.isLoadingPatients = true;
      try {
        const patients = await getPatientsRequest();
        this.registeredPatients = patients.map((patient) => ({
          id: String(patient.id),
          name: patient.name ?? "",
          cpf: typeof patient.cpf === "string" ? patient.cpf : "",
          birthDate: patient.birthDate ?? "",
          phone: typeof patient.phone === "string" ? patient.phone : "",
          patientPlans: Array.isArray(patient.patientPlans)
            ? patient.patientPlans
            : [],
          currentHealthPlan: patient.currentHealthPlan ?? null,
        }));
      } catch (_error) {
        this.errorMessage =
          "Nao foi possivel carregar os pacientes. Tente novamente.";
      } finally {
        this.isLoadingPatients = false;
      }
    },
    async loadHealthPlans(): Promise<void> {
      this.isLoadingHealthPlans = true;
      try {
        this.healthPlans = await getHealthPlansRequest();
      } finally {
        this.isLoadingHealthPlans = false;
      }
    },
    async onSubmit(): Promise<void> {
      this.errorMessage = "";
      this.successMessage = "";

      const normalizedPhone = this.validateAndNormalizePhone();
      if (!normalizedPhone) {
        return;
      }

      const patient: RegisteredPatient = {
        id:
          this.editingPatientId ??
          `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: this.form.name,
        cpf: this.form.cpf,
        phone: normalizedPhone,
        birthDate: this.form.birthDate,
        patientPlans: this.getPatientPlansById(this.editingPatientId),
        currentHealthPlan: this.getCurrentHealthPlanById(this.editingPatientId),
      };

      try {
        this.isSubmitting = true;

        if (this.isEditing) {
          await updatePatientRequest(
            patient.id,
            this.buildPatientPayload(patient.name, patient.phone)
          );
          await this.loadPatients();
          this.successMessage = "Paciente atualizado com sucesso.";
        } else {
          await registerPatientRequest(
            this.buildPatientPayload(patient.name, patient.phone)
          );
          await this.loadPatients();
          this.successMessage = "Paciente cadastrado com sucesso.";
        }

        this.resetForm();
        this.isFormDialogOpen = false;
      } catch (error: unknown) {
        this.errorMessage = this.isEditing
          ? "Não foi possível salvar o paciente. Tente novamente."
          : this.getCreatePatientErrorMessage(error);
      } finally {
        this.isSubmitting = false;
      }
    },
    getCreatePatientErrorMessage(error: unknown): string {
      const fallbackMessage =
        "Não foi possível cadastrar o paciente. Tente novamente.";

      if (typeof error !== "object" || error === null) {
        return fallbackMessage;
      }

      const errorWithResponse = error as {
        message?: unknown;
        response?: { data?: unknown };
      };

      const responseData = errorWithResponse.response?.data;
      if (typeof responseData === "string" && responseData.trim()) {
        return responseData;
      }

      if (typeof responseData === "object" && responseData !== null) {
        const dataWithMessage = responseData as {
          message?: unknown;
          error?: unknown;
        };

        if (
          typeof dataWithMessage.message === "string" &&
          dataWithMessage.message.trim()
        ) {
          return dataWithMessage.message;
        }

        if (
          typeof dataWithMessage.error === "string" &&
          dataWithMessage.error.trim()
        ) {
          return dataWithMessage.error;
        }
      }

      if (
        typeof errorWithResponse.message === "string" &&
        errorWithResponse.message.trim()
      ) {
        return errorWithResponse.message;
      }

      return fallbackMessage;
    },
    formatBirthDate(value: string): string {
      const parsed = new Date(`${value}T00:00:00`);
      if (Number.isNaN(parsed.getTime())) {
        return value;
      }
      return parsed.toLocaleDateString("pt-BR");
    },
    formatPhone(value: string | null | undefined): string {
      if (!value) {
        return "-";
      }
      const digits = value.replace(/\D/g, "");
      if (digits.length === 11) {
        return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
      }
      if (digits.length === 10) {
        return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
      }
      return value;
    },
    formatCpf(value: string): string {
      const digits = value.replace(/\D/g, "");
      if (digits.length !== 11) {
        return value || "-";
      }
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    },
    formatPatientPlans(plans: PatientPlan[]): string {
      if (!plans.length) {
        return "-";
      }
      return plans.map((plan) => plan.healthPlan.description).join(", ");
    },
    formatCurrentHealthPlan(plan: CurrentHealthPlan | null): string {
      if (!plan) {
        return "-";
      }
      return `${plan.description} (${plan.contractNumber})`;
    },
    resetFormValidation(): void {
      const patientFormRef = this.$refs.patientForm as
        | { resetValidation: () => void }
        | undefined;
      patientFormRef?.resetValidation();
    },
    resetForm(): void {
      this.form = {
        name: "",
        cpf: "",
        phone: "",
        birthDate: "",
        healthPlanId: null,
        contractNumber: "",
      };
      this.editingPatientId = null;
      this.resetFormValidation();
    },
    validateAndNormalizePhone(): string | null {
      if (
        !this.form.name ||
        !this.form.cpf ||
        !this.form.birthDate ||
        !this.form.phone
      ) {
        this.errorMessage =
          "Informe nome, CPF, data de aniversario e telefone.";
        return null;
      }
      const normalizedCpf = this.form.cpf.replace(/\D/g, "");
      if (normalizedCpf.length !== 11) {
        this.errorMessage = "Informe um CPF valido com 11 digitos.";
        return null;
      }
      if (new Date(this.form.birthDate) > new Date()) {
        this.errorMessage =
          "A data de aniversario nao pode ser maior que a data atual.";
        return null;
      }
      const normalizedPhone = this.form.phone.replace(/\D/g, "");
      if (normalizedPhone.length < 10 || normalizedPhone.length > 11) {
        this.errorMessage =
          "Informe um telefone valido com DDD (10 ou 11 digitos).";
        return null;
      }
      return normalizedPhone;
    },
    buildPatientPayload(name: string, phone: string): PatientPayload {
      const payload: PatientPayload = {
        name,
        cpf: this.form.cpf.replace(/\D/g, ""),
        phone,
        birthDate: this.form.birthDate,
      };
      if (this.form.healthPlanId) {
        payload.healthPlanEnrollment = {
          healthPlanId: this.form.healthPlanId,
          contractNumber: this.form.contractNumber || "",
        };
      } else {
        payload.healthPlanEnrollment = null;
      }
      return payload;
    },
    updatePatient(patient: RegisteredPatient): void {
      this.registeredPatients = this.registeredPatients.map((currentPatient) =>
        currentPatient.id === patient.id ? patient : currentPatient
      );
    },
    getPatientPlansById(patientId: string | null): PatientPlan[] {
      if (!patientId) {
        return [];
      }
      const existingPatient = this.registeredPatients.find(
        (patient) => patient.id === patientId
      );
      return existingPatient?.patientPlans ?? [];
    },
    getCurrentHealthPlanById(
      patientId: string | null
    ): CurrentHealthPlan | null {
      if (!patientId) {
        return null;
      }
      const existingPatient = this.registeredPatients.find(
        (patient) => patient.id === patientId
      );
      return existingPatient?.currentHealthPlan ?? null;
    },
    startEdit(patient: RegisteredPatient): void {
      this.errorMessage = "";
      this.successMessage = "";
      this.editingPatientId = patient.id;
      this.isFormDialogOpen = true;
      this.form = {
        name: patient.name,
        cpf: patient.cpf,
        phone: this.formatPhone(patient.phone),
        birthDate: patient.birthDate,
        healthPlanId: patient.currentHealthPlan?.healthPlanId ?? null,
        contractNumber: patient.currentHealthPlan?.contractNumber ?? "",
      };
      this.resetFormValidation();
    },
    openCreateDialog(): void {
      this.errorMessage = "";
      this.successMessage = "";
      this.isFormDialogOpen = true;
      this.resetForm();
    },
    closeFormDialog(): void {
      this.isFormDialogOpen = false;
      this.cancelEdit();
    },
    cancelEdit(): void {
      this.errorMessage = "";
      this.successMessage = "";
      this.resetForm();
    },
    openDeleteDialog(patient: RegisteredPatient): void {
      this.patientToDelete = patient;
      this.isDeleteDialogOpen = true;
    },
    closeDeleteDialog(): void {
      this.isDeleteDialogOpen = false;
      this.patientToDelete = null;
    },
    async onDelete(): Promise<void> {
      if (!this.patientToDelete) {
        return;
      }

      const patientId = this.patientToDelete.id;
      try {
        await deletePatientRequest(patientId);
        await this.loadPatients();

        if (this.editingPatientId === patientId) {
          this.cancelEdit();
        }

        this.successMessage = "Paciente excluido com sucesso.";
        this.showToast("positive", "Paciente excluido com sucesso.");
        this.closeDeleteDialog();
      } catch (error) {
        const message = this.extractErrorMessage(
          error,
          "Nao foi possivel excluir o paciente."
        );
        this.errorMessage = message;
        this.showToast("negative", message);
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.patient-register {
  width: min(1200px, 90%);
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
    margin: 0 0 0.35rem;
    font-size: 1.65rem;
    color: #0d3d5c;
  }

  p {
    margin: 0;
    color: #5a7a8c;
  }
}

.list-card {
  border-radius: 12px;
  border-color: #d4e5ee;
  background: #fff;
  min-height: 540px;
}

.form-grid {
  display: grid;
  gap: 0.85rem;
}

.feedback {
  border-radius: 8px;
  font-size: 0.92rem;
  padding: 0.5rem 0.75rem;
}

.error {
  background: #ffebee;
  color: #9b1c1c;
}

.success {
  background: #e8f5e9;
  color: #166534;
}

.submit-btn {
  min-height: 42px;
  border-radius: 8px;
}

.list-card {
  margin-top: 1.2rem;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #0d3d5c;
}

.search-input {
  width: min(320px, 100%);
}

.new-patient-btn {
  min-height: 34px;
  padding-inline: 0.75rem;
}

.form-dialog {
  width: min(620px, 95vw);
}

.form-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.actions-cell {
  display: flex;
  justify-content: flex-end;
  gap: 0.25rem;
}

.delete-dialog {
  width: min(420px, 95vw);
}

@media (max-width: 520px) {
  .patient-register {
    padding: 1.5rem 0.75rem 2rem;
  }

  .header,
  .list-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-input {
    width: 100%;
  }
}
</style>
