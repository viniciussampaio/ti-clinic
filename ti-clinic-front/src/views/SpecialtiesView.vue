<template>
  <section class="specialties">
    <div class="header">
      <h1>Especialidades</h1>
      <q-btn
        color="primary"
        unelevated
        icon="add"
        label="Nova especialidade"
        @click="openCreateDialog"
      />
    </div>

    <q-card flat bordered class="specialties-card">
      <q-card-section class="specialties-header">
        <h2>Especialidades cadastradas</h2>
      </q-card-section>
      <q-separator />
      <q-table
        flat
        dense
        :data="specialties"
        :columns="columns"
        row-key="id"
        :loading="isLoadingSpecialties"
        no-data-label="Nenhuma especialidade cadastrada."
      >
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
                @click="onDeleteSpecialty(props.row.id)"
              />
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="isDialogOpen" persistent>
      <q-card class="dialog-card">
        <q-card-section class="dialog-header">
          <div class="text-h6">
            {{
              editingSpecialtyId ? "Editar especialidade" : "Nova especialidade"
            }}
          </div>
          <q-btn dense flat round icon="close" @click="onCloseDialog" />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-form @submit.prevent="onSubmitSpecialty">
            <div class="form-grid">
              <q-input
                v-model.trim="form.name"
                outlined
                label="Nome da especialidade"
                :disable="isSubmitting"
                lazy-rules
                :rules="[validateRequiredName]"
              />
              <div class="form-actions">
                <q-btn flat label="Cancelar" @click="onCloseDialog" />
                <q-btn
                  type="submit"
                  color="primary"
                  unelevated
                  :loading="isSubmitting"
                  :disable="isSubmitting"
                  :label="editingSpecialtyId ? 'Salvar alterações' : 'Salvar'"
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
  createSpecialtyRequest,
  deleteSpecialtyRequest,
  getSpecialtiesRequest,
  updateSpecialtyRequest,
} from "@/services/specialties/specialties";
import { Specialty } from "@/types/specialty";

interface SpecialtyRow {
  id: string;
  name: string;
}

export default Vue.extend({
  name: "SpecialtiesView",
  data(): {
    specialties: SpecialtyRow[];
    isLoadingSpecialties: boolean;
    isDialogOpen: boolean;
    isSubmitting: boolean;
    editingSpecialtyId: string | null;
    form: Specialty;
    columns: Array<{
      name: string;
      label: string;
      field: string;
      align?: "left" | "right" | "center";
      sortable?: boolean;
    }>;
  } {
    return {
      specialties: [],
      isLoadingSpecialties: false,
      isDialogOpen: false,
      isSubmitting: false,
      editingSpecialtyId: null,
      form: {
        name: "",
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
          label: "Especialidade",
          field: "name",
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
    void this.loadSpecialties();
  },
  methods: {
    validateRequiredName(value: string): true | string {
      return Boolean(value) || "Informe o nome da especialidade.";
    },
    async loadSpecialties(): Promise<void> {
      this.isLoadingSpecialties = true;
      try {
        const specialties = await getSpecialtiesRequest();
        this.specialties = specialties.map((specialty, index) => ({
          id: String((specialty as { id?: string | number }).id ?? index + 1),
          name: specialty.name,
        }));
      } finally {
        this.isLoadingSpecialties = false;
      }
    },
    openCreateDialog(): void {
      this.editingSpecialtyId = null;
      this.form = { name: "" };
      this.isDialogOpen = true;
    },
    openEditDialog(specialty: SpecialtyRow): void {
      this.editingSpecialtyId = specialty.id;
      this.form = { name: specialty.name };
      this.isDialogOpen = true;
    },
    async onSubmitSpecialty(): Promise<void> {
      if (!this.form.name) {
        return;
      }
      try {
        this.isSubmitting = true;
        if (this.editingSpecialtyId) {
          await updateSpecialtyRequest(this.editingSpecialtyId, this.form);
        } else {
          await createSpecialtyRequest(this.form);
        }
        await this.loadSpecialties();
        this.onCloseDialog();
      } finally {
        this.isSubmitting = false;
      }
    },
    async onDeleteSpecialty(id: string): Promise<void> {
      await deleteSpecialtyRequest(id);
      await this.loadSpecialties();
    },
    onCloseDialog(): void {
      this.isDialogOpen = false;
      this.editingSpecialtyId = null;
      this.form = { name: "" };
    },
  },
});
</script>

<style lang="scss" scoped>
.specialties {
  width: min(900px, 90%);
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

.specialties-card {
  border-radius: 12px;
  border-color: #d4e5ee;
  background: #fff;
  min-height: 540px;
}

.specialties-header h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #0d3d5c;
}

.dialog-card {
  width: min(620px, 95vw);
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
  .specialties {
    padding: 1.5rem 0.75rem 2rem;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
