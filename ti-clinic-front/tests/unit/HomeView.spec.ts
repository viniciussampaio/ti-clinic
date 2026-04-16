import { shallowMount } from "@vue/test-utils";
import HomeView from "@/views/HomeView.vue";
import { flushPromises } from "./helpers/flush-promises";

jest.mock("@/services/consultations/consultations", () => ({
  getConsultationsRequest: jest.fn(),
}));

const { getConsultationsRequest } = jest.requireMock(
  "@/services/consultations/consultations"
) as {
  getConsultationsRequest: jest.Mock;
};

function mountView() {
  return shallowMount(HomeView, {
    stubs: [
      "q-btn",
      "q-banner",
      "q-card",
      "q-card-section",
      "q-separator",
    ],
    mocks: {
      $router: { push: jest.fn() },
    },
  });
}

describe("HomeView.vue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads upcoming appointments on mount", async () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayKey = `${yyyy}-${mm}-${dd}`;

    getConsultationsRequest.mockResolvedValueOnce([
      {
        id: 1,
        appointmentDate: todayKey,
        appointmentTime: "13:45:00",
        isPrivatePay: false,
        patient: { name: "Joao" },
        doctor: { name: "Dra. Carla", specialty: { name: "Cardiologia" } },
        specialty: { name: "Cardiologia" },
        procedures: [],
      },
    ]);

    const wrapper = mountView();
    await flushPromises();

    const vm = wrapper.vm as any;
    expect(getConsultationsRequest).toHaveBeenCalled();
    expect(vm.upcoming).toHaveLength(1);
    expect(vm.stats.today).toBe(1);
  });

  it("navigates to appointments page", async () => {
    getConsultationsRequest.mockResolvedValueOnce([]);
    const wrapper = mountView();
    await flushPromises();

    const vm = wrapper.vm as any;
    vm.goToAppointments();
    expect((wrapper.vm as any).$router.push).toHaveBeenCalledWith({
      path: "/agendamentos",
    });
  });
});

