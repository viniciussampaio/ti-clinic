<template>
  <section class="home">
    <header class="home-header">
      <div>
        <h1>Painel</h1>
        <p class="lead">
          Visão rápida da agenda e acesso rápido aos agendamentos.
        </p>
      </div>
      <div class="header-actions">
        <q-btn
          color="primary"
          unelevated
          icon="event"
          label="Ver agendamentos"
          @click="goToAppointments"
        />
      </div>
    </header>

    <q-banner v-if="errorMessage" dense class="feedback error">
      {{ errorMessage }}
    </q-banner>

    <div class="stats-grid">
      <q-card flat bordered class="stat-card">
        <q-card-section>
          <div class="stat-label">Hoje</div>
          <div class="stat-value">{{ stats.today }}</div>
        </q-card-section>
      </q-card>
      <q-card flat bordered class="stat-card">
        <q-card-section>
          <div class="stat-label">Amanhã</div>
          <div class="stat-value">{{ stats.tomorrow }}</div>
        </q-card-section>
      </q-card>
      <q-card flat bordered class="stat-card">
        <q-card-section>
          <div class="stat-label">Próximos 7 dias</div>
          <div class="stat-value">{{ stats.next7Days }}</div>
        </q-card-section>
      </q-card>
      <q-card flat bordered class="stat-card">
        <q-card-section>
          <div class="stat-label">Particular (7 dias)</div>
          <div class="stat-value">{{ stats.privatePay }}</div>
        </q-card-section>
      </q-card>
    </div>

    <q-card flat bordered class="list-card">
      <q-card-section class="list-header">
        <div>
          <h2>Próximos agendamentos</h2>
          <p class="sublead">Hoje + próximos 7 dias</p>
        </div>
        <q-btn
          flat
          dense
          icon="refresh"
          :loading="isLoading"
          label="Atualizar"
          @click="loadUpcomingAppointments"
        />
      </q-card-section>
      <q-separator />

      <q-card-section
        v-if="!isLoading && !groupedUpcoming.length"
        class="empty"
      >
        Nenhum agendamento para os próximos dias.
      </q-card-section>

      <div v-else class="groups">
        <div v-for="group in groupedUpcoming" :key="group.key" class="group">
          <div class="group-title">
            <span class="group-date">{{ group.label }}</span>
            <span class="group-count">{{ group.items.length }}</span>
          </div>
          <div class="group-list">
            <div v-for="item in group.items" :key="item.id" class="row">
              <div class="row-time">{{ item.time }}</div>
              <div class="row-main">
                <div class="row-primary">{{ item.patientName }}</div>
                <div v-if="!item.isProcedure" class="row-secondary">
                  {{ item.professionalOrProcedure }}
                </div>
              </div>
              <div class="row-meta">
                <span class="specialty-text">{{ item.specialty || "-" }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </q-card>
  </section>
</template>

<script lang="ts">
import Vue from "vue";
import { Appointment as ApiAppointment } from "@/types/consultations";
import { getConsultationsRequest } from "@/services/consultations/consultations";

type UpcomingItem = {
  id: string;
  appointmentDate: string;
  dateLabel: string;
  time: string;
  patientName: string;
  professionalOrProcedure: string;
  isProcedure: boolean;
  isPrivatePay: boolean;
  specialty: string;
};

export default Vue.extend({
  name: "HomeView",
  data(): {
    isLoading: boolean;
    errorMessage: string;
    upcoming: UpcomingItem[];
  } {
    return {
      isLoading: false,
      errorMessage: "",
      upcoming: [],
    };
  },
  computed: {
    stats(): {
      today: number;
      tomorrow: number;
      next7Days: number;
      privatePay: number;
    } {
      const todayKey = this.toDateKey(new Date());
      const tomorrowKey = this.toDateKey(this.addDays(new Date(), 1));
      const items = this.upcoming;
      return {
        today: items.filter((item) => item.appointmentDate === todayKey).length,
        tomorrow: items.filter((item) => item.appointmentDate === tomorrowKey)
          .length,
        next7Days: items.length,
        privatePay: items.filter((item) => item.isPrivatePay).length,
      };
    },
    groupedUpcoming(): Array<{
      key: string;
      label: string;
      items: UpcomingItem[];
    }> {
      const groups = new Map<string, UpcomingItem[]>();
      for (const item of this.upcoming) {
        const list = groups.get(item.appointmentDate) ?? [];
        list.push(item);
        groups.set(item.appointmentDate, list);
      }

      return Array.from(groups.entries())
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, items]) => ({
          key,
          label: this.formatRelativeDateLabel(key),
          items: items.sort((a, b) => a.time.localeCompare(b.time)),
        }));
    },
  },
  mounted(): void {
    void this.loadUpcomingAppointments();
  },
  methods: {
    goToAppointments(): void {
      this.$router.push({ path: "/agendamentos" });
    },
    addDays(date: Date, days: number): Date {
      const next = new Date(date);
      next.setDate(next.getDate() + days);
      return next;
    },
    toDateKey(date: Date): string {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    isWithinNextDays(dateKey: string, daysAhead: number): boolean {
      if (!dateKey) {
        return false;
      }
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = this.addDays(start, daysAhead);
      end.setHours(23, 59, 59, 999);

      const parsed = new Date(`${dateKey}T00:00:00`);
      if (Number.isNaN(parsed.getTime())) {
        return false;
      }
      return parsed >= start && parsed <= end;
    },
    formatTime(value: string | null | undefined): string {
      if (!value) {
        return "-";
      }
      return value.slice(0, 5);
    },
    formatSpecialtyName(appointment: ApiAppointment): string {
      const specialtyName =
        appointment.doctor?.specialty?.name?.trim() ??
        appointment.specialty?.name?.trim();
      if (specialtyName) {
        return specialtyName;
      }
      return "-";
    },
    formatRightSideLabel(appointment: ApiAppointment): string {
      const hasDoctor = Boolean(appointment.doctor);
      if (hasDoctor) {
        return this.formatSpecialtyName(appointment);
      }
      const procedures = Array.isArray(appointment.procedures)
        ? appointment.procedures
        : [];
      const procedureNames = procedures
        .map((procedure) => procedure.name?.trim())
        .filter((name): name is string => Boolean(name));
      return procedureNames.length ? procedureNames.join(", ") : "-";
    },
    formatProfessionalOrProcedure(appointment: ApiAppointment): string {
      const doctorName = appointment.doctor?.name?.trim();
      if (doctorName) {
        return doctorName;
      }
      return "-";
    },
    formatRelativeDateLabel(dateKey: string): string {
      const todayKey = this.toDateKey(new Date());
      const tomorrowKey = this.toDateKey(this.addDays(new Date(), 1));
      if (dateKey === todayKey) {
        return "Hoje";
      }
      if (dateKey === tomorrowKey) {
        return "Amanhã";
      }
      const parsed = new Date(`${dateKey}T00:00:00`);
      if (Number.isNaN(parsed.getTime())) {
        return dateKey;
      }
      return parsed.toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
    async loadUpcomingAppointments(): Promise<void> {
      this.errorMessage = "";
      this.isLoading = true;
      try {
        const consultations = await getConsultationsRequest();
        const upcoming = consultations
          .filter((appointment) =>
            this.isWithinNextDays(appointment.appointmentDate, 7),
          )
          .map((appointment) => {
            const isPrivatePay = Boolean(appointment.isPrivatePay);
            const isProcedure = !appointment.doctor;
            const upcomingItem: UpcomingItem = {
              id: String(appointment.id),
              appointmentDate: appointment.appointmentDate ?? "",
              dateLabel: this.formatRelativeDateLabel(
                appointment.appointmentDate ?? "",
              ),
              time: this.formatTime(appointment.appointmentTime),
              patientName: appointment.patient?.name ?? "-",
              professionalOrProcedure:
                this.formatProfessionalOrProcedure(appointment),
              isProcedure,
              isPrivatePay,
              specialty: this.formatRightSideLabel(appointment),
            };
            console.log("UpcomingItem:", upcomingItem);
            return upcomingItem;
          })
          .filter((item) => Boolean(item.appointmentDate));

        this.upcoming = upcoming;
      } catch (_error) {
        this.errorMessage =
          "Nao foi possivel carregar os agendamentos. Tente novamente.";
      } finally {
        this.isLoading = false;
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.home {
  width: min(1140px, 100%);
  margin: 0 auto;
  padding: 2rem 1rem 2.5rem;
}

.home-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;

  h1 {
    margin: 0;
    font-size: 1.65rem;
    color: #0d3d5c;
  }
}

.lead {
  margin: 0.35rem 0 0;
  color: #5a7a8c;
  line-height: 1.5;
}

.header-actions {
  flex: 0 0 auto;
}

.feedback.error {
  margin-bottom: 1rem;
  background: #fff5f5;
  border: 1px solid #f2c6c6;
  color: #6b2d2d;
  border-radius: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 1rem 0 1.25rem;
}

.stat-card {
  border-radius: 12px;
  border-color: #d4e5ee;
  background: #fff;
}

.stat-label {
  color: #5a7a8c;
  font-size: 0.85rem;
  font-weight: 600;
}

.stat-value {
  margin-top: 0.25rem;
  font-size: 1.6rem;
  font-weight: 700;
  color: #0d3d5c;
}

.list-card {
  border-radius: 12px;
  border-color: #d4e5ee;
  background: #fff;
}

.list-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;

  h2 {
    margin: 0;
    font-size: 1.1rem;
    color: #0d3d5c;
  }
}

.sublead {
  margin: 0.25rem 0 0;
  color: #5a7a8c;
  font-size: 0.9rem;
}

.empty {
  color: #5a7a8c;
}

.groups {
  padding: 0.75rem 1rem 1rem;
  width: 100%;
}

.group {
  width: 100%;
}

.group + .group {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eef5f9;
}

.group-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.group-date {
  font-weight: 700;
  color: #0d3d5c;
}

.group-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.6rem;
  height: 1.6rem;
  padding: 0 0.5rem;
  border-radius: 999px;
  background: #eef5f9;
  color: #355062;
  font-weight: 700;
  font-size: 0.85rem;
}

.group-list {
  display: grid;
  gap: 0.5rem;
  width: 100%;
}

.row {
  width: 100%;
  display: grid;
  grid-template-columns: 4.5rem minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  border: 1px solid #eef5f9;
  background: #fbfdfe;
  overflow: hidden;
}

.row-time {
  font-weight: 800;
  color: #0d3d5c;
}

.row-primary {
  font-weight: 700;
  color: #1a2f3d;
}

.row-secondary {
  margin-top: 0.1rem;
  font-size: 0.9rem;
  color: #5a7a8c;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-meta {
  display: flex;
  justify-content: center;
  min-width: 0;
}

.specialty-text {
  font-size: 0.9rem;
  font-weight: 700;
  color: #355062;
  text-align: right;
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .home-header {
    flex-direction: column;
    align-items: stretch;
  }

  .row {
    grid-template-columns: 4.25rem minmax(0, 1fr);
  }

  .row-meta {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }
}
</style>
