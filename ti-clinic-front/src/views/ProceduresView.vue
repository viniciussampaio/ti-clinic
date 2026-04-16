<template>
  <section class="procedures">
    <div class="header">
      <h1>Procedimentos</h1>
      <q-btn
        color="primary"
        unelevated
        icon="add"
        label="Novo procedimento"
        @click="openCreateDialog"
      />
    </div>

    <q-card flat bordered class="procedures-card">
      <q-card-section class="procedures-header">
        <h2>Procedimentos cadastrados</h2>
      </q-card-section>
      <q-separator />
      <q-table
        flat
        dense
        :data="procedures"
        :columns="columns"
        row-key="id"
        :loading="isLoadingProcedures"
        no-data-label="Nenhum procedimento cadastrado."
      >
        <template #body-cell-price="props">
          <q-td :props="props">
            {{ formatPrice(props.row.price) }}
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
                @click="onDeleteProcedure(props.row.id)"
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
              editingProcedureId ? "Editar procedimento" : "Novo procedimento"
            }}
          </div>
          <q-btn dense flat round icon="close" @click="onCloseDialog" />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-form @submit.prevent="onSubmitProcedure">
            <div class="form-grid">
              <q-input
                v-model.trim="form.name"
                outlined
                label="Nome do procedimento"
                :disable="isSubmitting"
                lazy-rules
                :rules="[validateRequiredName]"
              />
              <q-input
                v-model.trim="form.price"
                outlined
                label="Preco"
                prefix="R$"
                :disable="isSubmitting"
                lazy-rules
                :rules="[validateRequiredPrice]"
              />
              <div class="form-actions">
                <q-btn flat label="Cancelar" @click="onCloseDialog" />
                <q-btn
                  type="submit"
                  color="primary"
                  unelevated
                  :loading="isSubmitting"
                  :disable="isSubmitting"
                  :label="editingProcedureId ? 'Salvar alterações' : 'Salvar'"
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
  getProceduresRequest,
  updateSpecialtyRequest,
} from "@/services/procedures/procedures";
import { Procedure } from "@/types/procedures";

interface ProcedureRow {
  id: string;
  name: string;
  price: string;
}

interface ProcedureFormState {
  name: string;
  price: string;
}

export default Vue.extend({
  name: "ProceduresView",
  data(): {
    procedures: ProcedureRow[];
    isLoadingProcedures: boolean;
    isDialogOpen: boolean;
    isSubmitting: boolean;
    editingProcedureId: string | null;
    form: ProcedureFormState;
    columns: Array<{
      name: string;
      label: string;
      field: string;
      align?: "left" | "right" | "center";
      sortable?: boolean;
    }>;
  } {
    return {
      procedures: [],
      isLoadingProcedures: false,
      isDialogOpen: false,
      isSubmitting: false,
      editingProcedureId: null,
      form: {
        name: "",
        price: "",
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
          label: "Procedimento",
          field: "name",
          align: "left",
          sortable: true,
        },
        {
          name: "price",
          label: "Preco",
          field: "price",
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
    void this.loadProcedures();
  },
  methods: {
    validateRequiredName(value: string): true | string {
      return Boolean(value) || "Informe o nome do procedimento.";
    },
    validateRequiredPrice(value: string): true | string {
      return Boolean(value) || "Informe o preco.";
    },
    formatPrice(value: string): string {
      const normalized = Number(String(value).replace(",", "."));
      if (Number.isNaN(normalized)) {
        return value;
      }
      return normalized.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    },
    async loadProcedures(): Promise<void> {
      this.isLoadingProcedures = true;
      try {
        const procedures = await getProceduresRequest();
        this.procedures = procedures.map((procedure, index) => ({
          id: String((procedure as { id?: number | string }).id ?? index + 1),
          name: procedure.name,
          price: procedure.price,
        }));
      } finally {
        this.isLoadingProcedures = false;
      }
    },
    openCreateDialog(): void {
      this.editingProcedureId = null;
      this.form = {
        name: "",
        price: "",
      };
      this.isDialogOpen = true;
    },
    openEditDialog(procedure: ProcedureRow): void {
      this.editingProcedureId = procedure.id;
      this.form = {
        name: procedure.name,
        price: procedure.price,
      };
      this.isDialogOpen = true;
    },
    async onSubmitProcedure(): Promise<void> {
      if (!this.form.name || !this.form.price) {
        return;
      }
      const payload: Procedure = {
        id: this.editingProcedureId ? Number(this.editingProcedureId) : 0,
        name: this.form.name,
        price: this.form.price,
      };
      try {
        this.isSubmitting = true;
        if (this.editingProcedureId) {
          await updateSpecialtyRequest(this.editingProcedureId, payload);
        } else {
          await createSpecialtyRequest(payload);
        }
        await this.loadProcedures();
        this.onCloseDialog();
      } finally {
        this.isSubmitting = false;
      }
    },
    async onDeleteProcedure(id: string): Promise<void> {
      await deleteSpecialtyRequest(id);
      await this.loadProcedures();
    },
    onCloseDialog(): void {
      this.isDialogOpen = false;
      this.editingProcedureId = null;
      this.form = {
        name: "",
        price: "",
      };
    },
  },
});
</script>

<style lang="scss" scoped>
.procedures {
  width: min(900px, 100%);
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

.procedures-card {
  border-radius: 12px;
  border-color: #d4e5ee;
  background: #fff;
  min-height: 540px;
}

.procedures-header h2 {
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
  .procedures {
    padding: 1.5rem 0.75rem 2rem;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
