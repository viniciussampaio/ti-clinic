<template>
  <section class="doctors">
    <div class="header">
      <q-btn
        color="primary"
        unelevated
        icon="add"
        label="Novo médico"
        @click="openCreateDialog"
      />
    </div>

    <q-card flat bordered class="doctors-card">
      <q-card-section class="doctors-header">
        <h2>Médicos cadastrados</h2>
      </q-card-section>
      <q-separator />
      <div class="table-scroll">
        <q-table
          flat
          dense
          :data="doctors"
          :columns="columns"
          row-key="id"
          :loading="isLoadingDoctors"
          no-data-label="Nenhum médico cadastrado."
        >
          <template #body-cell-specialty="props">
            <q-td :props="props">
              {{ formatSpecialtyName(props.row.specialty) }}
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
                  @click="openEditDialog(props.row)"
                />
                <q-btn
                  dense
                  flat
                  round
                  color="negative"
                  icon="delete"
                  @click="onDeleteDoctor(props.row.id)"
                />
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
    </q-card>

    <q-dialog v-model="isDialogOpen" persistent>
      <q-card class="dialog-card">
        <q-card-section class="dialog-header">
          <div class="text-h6">
            {{ editingDoctorId ? "Editar médico" : "Novo médico" }}
          </div>
          <q-btn dense flat round icon="close" @click="onCloseDialog" />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-form @submit.prevent="onSubmitDoctor">
            <div class="form-grid">
              <q-input
                v-model.trim="form.name"
                outlined
                label="Nome"
                :disable="isSubmitting"
                lazy-rules
                :rules="[validateRequiredName]"
              />
              <q-input
                v-model.trim="form.crm"
                outlined
                label="CRM"
                :disable="isSubmitting"
                lazy-rules
                :rules="[validateRequiredCrm]"
              />
              <q-select
                v-model="form.specialtyId"
                outlined
                emit-value
                map-options
                label="Especialidade"
                :options="specialtyOptions"
                :loading="isLoadingSpecialties"
                :disable="isSubmitting || isLoadingSpecialties"
                option-label="label"
                option-value="value"
                lazy-rules
                :rules="[validateRequiredSpecialty]"
              />
              <div class="form-actions">
                <q-btn flat label="Cancelar" @click="onCloseDialog" />
                <q-btn
                  type="submit"
                  color="primary"
                  unelevated
                  :loading="isSubmitting"
                  :disable="isSubmitting"
                  :label="editingDoctorId ? 'Salvar alterações' : 'Salvar'"
                />
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </section>
</template>

<script lang="ts">
import Vue from "vue";
import {
  createDoctorRequest,
  deleteDoctorRequest,
  getDoctorsRequest,
  updateDoctorRequest,
} from "@/services/doctors/doctor";
import { getSpecialtiesRequest } from "@/services/specialties/specialties";
import { Doctor } from "@/types/doctors";
import { Specialty } from "@/types/specialty";

interface DoctorFormState {
  name: string;
  crm: string;
  specialtyId: string;
}

interface SpecialtyOption {
  label: string;
  value: string;
}

export default Vue.extend({
  name: "DoctorsView",
  data(): {
    doctors: Doctor[];
    specialties: Specialty[];
    isLoadingDoctors: boolean;
    isLoadingSpecialties: boolean;
    isDialogOpen: boolean;
    isSubmitting: boolean;
    editingDoctorId: string | null;
    form: DoctorFormState;
    columns: Array<{
      name: string;
      label: string;
      field: string;
      align?: "left" | "right" | "center";
      sortable?: boolean;
      style?: string;
      headerStyle?: string;
    }>;
  } {
    return {
      doctors: [],
      specialties: [],
      isLoadingDoctors: false,
      isLoadingSpecialties: false,
      isDialogOpen: false,
      isSubmitting: false,
      editingDoctorId: null,
      form: {
        name: "",
        crm: "",
        specialtyId: "",
      },
      columns: [
        {
          name: "id",
          label: "ID",
          field: "id",
          align: "left",
          sortable: true,
        },
        {
          name: "name",
          label: "Nome",
          field: "name",
          align: "left",
          sortable: true,
        },
        {
          name: "crm",
          label: "CRM",
          field: "crm",
          align: "left",
          sortable: true,
        },
        {
          name: "specialty",
          label: "Especialidade",
          field: "specialty",
          align: "left",
          sortable: false,
        },
        {
          name: "actions",
          label: "Ações",
          field: "actions",
          align: "right",
          sortable: false,
          headerStyle: "text-align: right",
        },
      ],
    };
  },
  computed: {
    specialtyOptions(): SpecialtyOption[] {
      return this.specialties.map((specialty) => ({
        label: specialty.name,
        value: String(specialty.id || ""),
      }));
    },
  },
  mounted(): void {
    void Promise.all([this.loadDoctors(), this.loadSpecialties()]);
  },
  methods: {
    formatSpecialtyName(
      specialty: { name?: string | null } | null | undefined,
    ): string {
      const name =
        typeof specialty?.name === "string" ? specialty.name.trim() : "";
      return name || "-";
    },
    validateRequiredName(value: string): true | string {
      return Boolean(value) || "Informe o nome do médico.";
    },
    validateRequiredCrm(value: string): true | string {
      return Boolean(value) || "Informe o CRM.";
    },
    validateRequiredSpecialty(value: string): true | string {
      return Boolean(value) || "Informe a especialidade.";
    },
    async loadDoctors(): Promise<void> {
      this.isLoadingDoctors = true;
      try {
        this.doctors = await getDoctorsRequest();
      } finally {
        this.isLoadingDoctors = false;
      }
    },
    async loadSpecialties(): Promise<void> {
      this.isLoadingSpecialties = true;
      try {
        this.specialties = await getSpecialtiesRequest();
      } finally {
        this.isLoadingSpecialties = false;
      }
    },
    openCreateDialog(): void {
      this.editingDoctorId = null;
      this.form = {
        name: "",
        crm: "",
        specialtyId: "",
      };
      this.isDialogOpen = true;
    },
    openEditDialog(doctor: Doctor): void {
      this.editingDoctorId = doctor.id ?? null;
      this.form = {
        name: doctor.name,
        crm: doctor.crm,
        specialtyId: String(doctor.specialty?.id || ""),
      };
      this.isDialogOpen = true;
    },
    async onSubmitDoctor(): Promise<void> {
      if (!this.form.name || !this.form.crm || !this.form.specialtyId) {
        return;
      }
      const selectedSpecialty = this.specialties.find(
        (specialty) => String(specialty.id || "") === this.form.specialtyId,
      );
      if (!selectedSpecialty) {
        return;
      }

      const payload: Doctor = {
        name: this.form.name,
        crm: this.form.crm,
        specialty: {
          id: selectedSpecialty.id,
          name: selectedSpecialty.name,
        },
      };

      try {
        this.isSubmitting = true;
        if (this.editingDoctorId) {
          await updateDoctorRequest(this.editingDoctorId, payload);
        } else {
          await createDoctorRequest(payload);
        }
        await this.loadDoctors();
        this.onCloseDialog();
      } finally {
        this.isSubmitting = false;
      }
    },
    showToast(type: "positive" | "negative", message: string): void {
      const quasar = (
        this as Vue & {
          $q?: {
            notify: (payload: { type: string; message: string }) => void;
          };
        }
      ).$q;
      quasar?.notify({ type, message });
    },
    extractErrorMessage(error: unknown, fallback: string): string {
      const data = (
        error as {
          response?: { data?: { message?: string | string[] } };
        }
      )?.response?.data;
      const msg = data?.message;
      if (typeof msg === "string" && msg.trim()) {
        return msg.trim();
      }
      if (Array.isArray(msg) && msg.length && typeof msg[0] === "string") {
        return msg[0].trim();
      }
      return fallback;
    },
    async onDeleteDoctor(id: string): Promise<void> {
      try {
        await deleteDoctorRequest(id);
        await this.loadDoctors();
      } catch (error) {
        this.showToast(
          "negative",
          this.extractErrorMessage(error, "Nao foi possivel excluir o medico."),
        );
      }
    },
    onCloseDialog(): void {
      this.isDialogOpen = false;
      this.editingDoctorId = null;
      this.form = {
        name: "",
        crm: "",
        specialtyId: "",
      };
    },
  },
});
</script>

<style lang="scss" scoped>
.doctors {
  width: min(1140px, 100%);
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

.doctors-card {
  border-radius: 12px;
  border-color: #d4e5ee;
  background: #fff;
}

.doctors-card :deep(table.q-table) {
  table-layout: auto;
  width: 100%;
}

.doctors-card :deep(table.q-table) thead tr th,
.doctors-card :deep(table.q-table) tbody tr td {
  padding: 0.35rem 0.45rem;
}

.doctors-card :deep(table.q-table) thead tr th:first-child,
.doctors-card :deep(table.q-table) tbody tr td:first-child {
  padding-right: 0.35rem;
}

.doctors-card :deep(table.q-table) thead tr th:last-child,
.doctors-card :deep(table.q-table) tbody tr td:last-child {
  padding-left: 0.35rem;
}

.doctors-header h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #0d3d5c;
}

.dialog-card {
  width: min(620px, min(95vw, 100%));
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

@media (max-width: 520px) {
  .doctors {
    padding: 1.5rem 0.75rem 2rem;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
