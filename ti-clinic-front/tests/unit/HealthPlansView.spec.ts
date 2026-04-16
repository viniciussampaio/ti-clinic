import { shallowMount } from "@vue/test-utils";
import HealthPlansView from "@/views/HealthPlansView.vue";
import { flushPromises } from "./helpers/flush-promises";

jest.mock("@/services/health-plans/healthPlans", () => ({
  getHealthPlansRequest: jest.fn(),
  createHealthPlanRequest: jest.fn(),
  deleteHealthPlanRequest: jest.fn(),
}));

const {
  getHealthPlansRequest,
  deleteHealthPlanRequest,
} = jest.requireMock("@/services/health-plans/healthPlans") as {
  getHealthPlansRequest: jest.Mock;
  deleteHealthPlanRequest: jest.Mock;
};

function mountView() {
  return shallowMount(HealthPlansView, {
    stubs: [
      "q-btn",
      "q-card",
      "q-card-section",
      "q-card-actions",
      "q-separator",
      "q-table",
      "q-td",
      "q-dialog",
      "q-form",
      "q-input",
    ],
  });
}

describe("HealthPlansView.vue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads health plans on mount", async () => {
    getHealthPlansRequest.mockResolvedValueOnce([
      { id: 1, description: "Plano A", phone: "1111-111-1111" },
    ]);

    const wrapper = mountView();
    await flushPromises();

    const vm = wrapper.vm as any;
    expect(getHealthPlansRequest).toHaveBeenCalled();
    expect(vm.healthPlans).toHaveLength(1);
  });

  it("deletes a plan and reloads list", async () => {
    getHealthPlansRequest.mockResolvedValueOnce([]);
    const wrapper = mountView();
    await flushPromises();

    deleteHealthPlanRequest.mockResolvedValueOnce(undefined);
    getHealthPlansRequest.mockResolvedValueOnce([
      { id: 2, description: "Plano B", phone: "2222-222-2222" },
    ]);

    const vm = wrapper.vm as any;
    await vm.onDeletePlan("2");
    expect(deleteHealthPlanRequest).toHaveBeenCalledWith("2");
    expect(getHealthPlansRequest).toHaveBeenCalledTimes(2);
  });
});

