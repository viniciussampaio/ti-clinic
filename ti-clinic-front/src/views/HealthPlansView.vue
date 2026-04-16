<template>
  <section class="health-plans">
    <div class="header">
      <h1>Planos de Saude</h1>
      <q-btn
        color="primary"
        unelevated
        
        icon="add"
        label="Novo plano"
        @click="isDialogOpen = true"
      />
    </div>

    <q-card flat bordered class="plans-card">
      <q-card-section class="plans-header">
        <h2>Planos cadastrados</h2>
      </q-card-section>
      <q-separator />
      <q-table
        flat
        :data="healthPlans"
        :columns="columns"
        row-key="id"
        :loading="isLoadingPlans"
        no-data-label="Nenhum plano cadastrado."
      >
        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              dense
              flat
              round
              color="negative"
              icon="delete"
              @click="onDeletePlan(props.row.id)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="isDialogOpen" persistent>
      <q-card class="dialog-card">
        <q-card-section class="dialog-header">
          <div class="text-h6">Novo plano de saude</div>
          <q-btn dense flat round icon="close" @click="onCloseDialog" />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-form @submit.prevent="onCreatePlan">
            <div class="form-grid">
              <q-input
                v-model.trim="form.description"
                outlined
                label="Descrição"
                lazy-rules
                :rules="[validateRequiredDescription]"
              />
              <q-input
                v-model.trim="form.phone"
                outlined
                label="Telefone"
                mask="####-###-####"
                lazy-rules
                :rules="[validateRequiredPhone]"
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
  </section>
</template>

<script lang="ts">
import Vue from "vue";
import {
  createHealthPlanRequest,
  deleteHealthPlanRequest,
  getHealthPlansRequest,
} from "@/services/health-plans/healthPlans";
import { HealthPlan, HealthPlanForm } from "@/types/health-plans";

export default Vue.extend({
  name: "HealthPlansView",
  data(): {
    healthPlans: HealthPlan[];
    isDialogOpen: boolean;
    isLoadingPlans: boolean;
    isSubmitting: boolean;
    errorMessage: string;
    form: HealthPlanForm;
    columns: Array<{
      name: string;
      label: string;
      field: string;
      align?: "left" | "right" | "center";
      sortable?: boolean;
    }>;
  } {
    return {
      healthPlans: [],
      isDialogOpen: false,
      isLoadingPlans: false,
      isSubmitting: false,
      errorMessage: "",
      form: {
        description: "",
        phone: "",
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
          name: "description",
          label: "Descrição",
          field: "description",
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
    void this.loadHealthPlans();
  },
  methods: {
    validateRequiredDescription(value: string): true | string {
      return Boolean(value) || "Informe a descrição.";
    },
    validateRequiredPhone(value: string): true | string {
      return Boolean(value) || "Informe o telefone.";
    },
    async loadHealthPlans(): Promise<void> {
      this.errorMessage = "";
      this.isLoadingPlans = true;
      try {
        this.healthPlans = await getHealthPlansRequest();
      } catch (_error) {
        this.errorMessage =
          "Nao foi possivel carregar os planos de saude. Tente novamente.";
      } finally {
        this.isLoadingPlans = false;
      }
    },
    async onCreatePlan(): Promise<void> {
      if (!this.form.description || !this.form.phone) {
        return;
      }
      try {
        this.isSubmitting = true;
        await createHealthPlanRequest({
          description: this.form.description,
          phone: this.form.phone,
        });
        await this.loadHealthPlans();
        this.onCloseDialog();
      } finally {
        this.isSubmitting = false;
      }
    },
    async onDeletePlan(id: string): Promise<void> {
      try {
        await deleteHealthPlanRequest(id);
        await this.loadHealthPlans();
      } catch (_error) {
        this.errorMessage = "Nao foi possivel excluir o plano de saude.";
      }
    },
    onCloseDialog(): void {
      this.isDialogOpen = false;
      this.form = {
        description: "",
        phone: "",
      };
    },
  },
});
</script>

<style lang="scss" scoped>
.health-plans {
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

.plans-card {
  border-radius: 12px;
  border-color: #d4e5ee;
  background: #fff;
  min-height: 540px;
}

.plans-header h2 {
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

@media (max-width: 520px) {
  .health-plans {
    padding: 1.5rem 0.75rem 2rem;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
