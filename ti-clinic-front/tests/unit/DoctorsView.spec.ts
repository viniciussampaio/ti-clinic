import { shallowMount } from "@vue/test-utils";
import DoctorsView from "@/views/DoctorsView.vue";
import { flushPromises } from "./helpers/flush-promises";

jest.mock("@/services/doctors/doctor", () => ({
  getDoctorsRequest: jest.fn(),
  createDoctorRequest: jest.fn(),
  updateDoctorRequest: jest.fn(),
  deleteDoctorRequest: jest.fn(),
}));

jest.mock("@/services/specialties/specialties", () => ({
  getSpecialtiesRequest: jest.fn(),
}));

const { getDoctorsRequest, deleteDoctorRequest } = jest.requireMock(
  "@/services/doctors/doctor"
) as {
  getDoctorsRequest: jest.Mock;
  deleteDoctorRequest: jest.Mock;
};

const { getSpecialtiesRequest } = jest.requireMock(
  "@/services/specialties/specialties"
) as {
  getSpecialtiesRequest: jest.Mock;
};

function mountView() {
  return shallowMount(DoctorsView, {
    stubs: [
      "q-btn",
      "q-card",
      "q-card-section",
      "q-separator",
      "q-table",
      "q-td",
      "q-dialog",
      "q-form",
      "q-input",
      "q-select",
    ],
  });
}

describe("DoctorsView.vue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getSpecialtiesRequest.mockResolvedValue([]);
  });

  it("loads doctors and specialties on mount", async () => {
    getDoctorsRequest.mockResolvedValueOnce([
      { id: 1, name: "Dr A", crm: "123", specialty: { id: 1, name: "Cardio" } },
    ]);
    getSpecialtiesRequest.mockResolvedValueOnce([{ id: 1, name: "Cardio" }]);

    const wrapper = mountView();
    await flushPromises();

    expect(getDoctorsRequest).toHaveBeenCalled();
    expect(getSpecialtiesRequest).toHaveBeenCalled();
    expect((wrapper.vm as any).doctors).toHaveLength(1);
  });

  it("deletes a doctor and reloads list", async () => {
    getDoctorsRequest.mockResolvedValueOnce([]);
    const wrapper = mountView();
    await flushPromises();

    deleteDoctorRequest.mockResolvedValueOnce(undefined);
    getDoctorsRequest.mockResolvedValueOnce([{ id: 2, name: "Dr B", crm: "999" }]);

    await (wrapper.vm as any).onDeleteDoctor("2");
    expect(deleteDoctorRequest).toHaveBeenCalledWith("2");
    expect(getDoctorsRequest).toHaveBeenCalledTimes(2);
  });
});

