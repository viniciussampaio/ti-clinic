import { shallowMount } from "@vue/test-utils";
import AppointmentsView from "@/views/AppointmentsView.vue";
import { flushPromises } from "./helpers/flush-promises";

jest.mock("@/services/consultations/consultations", () => ({
  getConsultationsRequest: jest.fn(),
  createConsultationRequest: jest.fn(),
  deleteConsultationRequest: jest.fn(),
  updateConsultationRequest: jest.fn(),
}));

jest.mock("@/services/doctors/doctor", () => ({
  getDoctorsRequest: jest.fn().mockResolvedValue([]),
}));

jest.mock("@/services/procedures/procedures", () => ({
  getProceduresRequest: jest.fn().mockResolvedValue([]),
}));

jest.mock("@/services/patients/patient", () => ({
  getPatientByCpfRequest: jest.fn(),
}));

const {
  getConsultationsRequest,
  updateConsultationRequest,
  deleteConsultationRequest,
} = jest.requireMock("@/services/consultations/consultations") as {
  getConsultationsRequest: jest.Mock;
  updateConsultationRequest: jest.Mock;
  deleteConsultationRequest: jest.Mock;
};

function mountView() {
  return shallowMount(AppointmentsView, {
    stubs: [
      "q-btn",
      "q-btn-dropdown",
      "q-list",
      "q-item",
      "q-item-section",
      "q-icon",
      "q-card",
      "q-card-section",
      "q-card-actions",
      "q-separator",
      "q-table",
      "q-td",
      "q-dialog",
      "q-form",
      "q-option-group",
      "q-input",
      "q-select",
      "q-checkbox",
      "q-banner",
      "q-chip",
    ],
    mocks: {
      $q: {
        notify: jest.fn(),
      },
    },
  });
}

describe("AppointmentsView.vue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("maps consultations and procedures into table", async () => {
    getConsultationsRequest.mockResolvedValueOnce([
      {
        id: 1,
        appointmentDate: "2026-04-18",
        appointmentTime: "13:45:00",
        isPrivatePay: false,
        patient: { name: "Joao" },
        doctor: { name: "Dra. Carla" },
        procedures: [],
      },
      {
        id: 2,
        appointmentDate: "2026-04-18",
        appointmentTime: "14:00:00",
        isPrivatePay: true,
        patient: { name: "Maria" },
        doctor: null,
        procedures: [{ id: 10, name: "Eletrocardiograma" }],
      },
    ]);

    const wrapper = mountView();
    await flushPromises();

    const vm = wrapper.vm as any;
    expect(vm.appointments).toHaveLength(2);

    expect(vm.appointments[0]).toEqual(
      expect.objectContaining({
        id: "1",
        patientName: "Joao",
        doctorName: "Dra. Carla",
        time: "13:45",
      })
    );

    expect(vm.appointments[1]).toEqual(
      expect.objectContaining({
        id: "2",
        patientName: "Maria",
        doctorName: "Eletrocardiograma",
        time: "14:00",
      })
    );
  });

  it("opens edit dialog and sends update with date and time", async () => {
    getConsultationsRequest.mockResolvedValueOnce([]);
    const wrapper = mountView();
    await flushPromises();

    const vm = wrapper.vm as any;
    vm.openEditDialog({
      id: "9",
      numericId: 9,
      kind: "consultation",
      patientName: "Joao",
      patientCpf: "12345678901",
      doctorName: "Dra. Carla",
      isPrivatePay: false,
      procedureIds: [],
      appointmentDate: "2026-04-20",
      date: "20/04/2026",
      time: "10:15",
    });

    expect(vm.isEditDialogOpen).toBe(true);
    expect(vm.editForm.date).toBe("2026-04-20");
    expect(vm.editForm.time).toBe("10:15");

    updateConsultationRequest.mockResolvedValueOnce(undefined);
    await vm.onUpdateAppointment();

    expect(updateConsultationRequest).toHaveBeenCalledWith(9, {
      appointmentDate: "2026-04-20",
      appointmentTime: "10:15",
      isPrivatePay: false,
      procedureIds: [],
    });
  });

  it("cancels consultation calling deleteConsultationRequest", async () => {
    getConsultationsRequest.mockResolvedValueOnce([]);
    const wrapper = mountView();
    await flushPromises();

    const vm = wrapper.vm as any;
    vm.openCancelDialog({
      id: "7",
      numericId: 7,
      kind: "consultation",
      patientName: "Joao",
      patientCpf: "12345678901",
      doctorName: "Dra. Carla",
      isPrivatePay: false,
      procedureIds: [],
      appointmentDate: "2026-04-20",
      date: "20/04/2026",
      time: "10:15",
    });

    deleteConsultationRequest.mockResolvedValueOnce(undefined);
    await vm.onCancelAppointment();

    expect(deleteConsultationRequest).toHaveBeenCalledWith(7);
  });
});

