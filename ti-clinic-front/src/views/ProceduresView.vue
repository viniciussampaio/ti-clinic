<template>
  <section class="procedures">
    <div class="header">
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
      <div class="table-scroll">
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
      </div>
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
  createProcedureRequest,
  deleteProcedureRequest,
  getProceduresRequest,
  updateProcedureRequest,
} from "@/services/procedures/procedures";

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
      style?: string;
      headerStyle?: string;
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
          headerStyle: "text-align: right",
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
      if (!String(value).trim()) {
        return "Informe o preco.";
      }
      const parsed = this.parsePriceToNumber(value);
      if (parsed === null) {
        return "Informe um valor numerico valido.";
      }
      if (parsed < 0) {
        return "O preco nao pode ser negativo.";
      }
      return true;
    },
    parsePriceToNumber(raw: string): number | null {
      const cleaned = String(raw)
        .replace(/R\$\s?/gi, "")
        .trim();
      if (!cleaned) {
        return null;
      }
      const normalized = cleaned.includes(",")
        ? cleaned.replace(/\./g, "").replace(",", ".")
        : cleaned;
      const n = Number(normalized);
      return Number.isFinite(n) ? n : null;
    },
    priceForFormDisplay(raw: string): string {
      return String(raw)
        .replace(/R\$\s?/gi, "")
        .trim();
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
        price: this.priceForFormDisplay(procedure.price),
      };
      this.isDialogOpen = true;
    },
    async onSubmitProcedure(): Promise<void> {
      if (!this.form.name || !this.form.price) {
        return;
      }
      const price = this.parsePriceToNumber(this.form.price);
      if (price === null || price < 0) {
        return;
      }
      const payload = {
        name: this.form.name,
        price,
      };
      try {
        this.isSubmitting = true;
        if (this.editingProcedureId) {
          await updateProcedureRequest(this.editingProcedureId, payload);
        } else {
          await createProcedureRequest(payload);
        }
        await this.loadProcedures();
        this.onCloseDialog();
      } finally {
        this.isSubmitting = false;
      }
    },
    async onDeleteProcedure(id: string): Promise<void> {
      await deleteProcedureRequest(id);
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

.procedures-card {
  border-radius: 12px;
  border-color: #d4e5ee;
  background: #fff;
}

.procedures-card :deep(table.q-table) {
  table-layout: auto;
  width: 100%;
}

.procedures-card :deep(table.q-table) thead tr th,
.procedures-card :deep(table.q-table) tbody tr td {
  padding: 0.35rem 0.45rem;
}

.procedures-card :deep(table.q-table) thead tr th:first-child,
.procedures-card :deep(table.q-table) tbody tr td:first-child {
  padding-right: 0.35rem;
}

.procedures-card :deep(table.q-table) thead tr th:last-child,
.procedures-card :deep(table.q-table) tbody tr td:last-child {
  padding-left: 0.35rem;
}

.procedures-header h2 {
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
  .procedures {
    padding: 1.5rem 0.75rem 2rem;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
