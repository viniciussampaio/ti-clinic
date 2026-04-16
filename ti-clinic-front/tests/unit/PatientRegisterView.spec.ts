import { shallowMount } from "@vue/test-utils";
import PatientRegisterView from "@/views/PatientRegisterView.vue";
import { flushPromises } from "./helpers/flush-promises";

jest.mock("@/services/patients/patient", () => ({
  getPatientsRequest: jest.fn(),
  registerPatientRequest: jest.fn(),
  updatePatientRequest: jest.fn(),
  deletePatientRequest: jest.fn(),
}));

jest.mock("@/services/health-plans/healthPlans", () => ({
  getHealthPlansRequest: jest.fn(),
}));

const { getPatientsRequest } = jest.requireMock("@/services/patients/patient") as {
  getPatientsRequest: jest.Mock;
};

const { getHealthPlansRequest } = jest.requireMock(
  "@/services/health-plans/healthPlans"
) as {
  getHealthPlansRequest: jest.Mock;
};

function mountView() {
  return shallowMount(PatientRegisterView, {
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
      "q-select",
      "q-banner",
    ],
    mocks: {
      $q: { notify: jest.fn() },
    },
  });
}

describe("PatientRegisterView.vue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads patients and plans on mount", async () => {
    getPatientsRequest.mockResolvedValueOnce([]);
    getHealthPlansRequest.mockResolvedValueOnce([]);
    const wrapper = mountView();
    await flushPromises();

    expect(getPatientsRequest).toHaveBeenCalled();
    expect(getHealthPlansRequest).toHaveBeenCalled();
    expect((wrapper.vm as any).registeredPatients).toEqual([]);
  });

  it("shows error message when loading patients fails", async () => {
    getPatientsRequest.mockRejectedValueOnce(new Error("fail"));
    getHealthPlansRequest.mockResolvedValueOnce([]);
    const wrapper = mountView();
    await flushPromises();

    expect((wrapper.vm as any).errorMessage).toContain("Nao foi possivel");
  });
});

