import { shallowMount } from "@vue/test-utils";
import SpecialtiesView from "@/views/SpecialtiesView.vue";
import { flushPromises } from "./helpers/flush-promises";

jest.mock("@/services/specialties/specialties", () => ({
  getSpecialtiesRequest: jest.fn(),
  createSpecialtyRequest: jest.fn(),
  updateSpecialtyRequest: jest.fn(),
  deleteSpecialtyRequest: jest.fn(),
}));

const {
  getSpecialtiesRequest,
  deleteSpecialtyRequest,
} = jest.requireMock("@/services/specialties/specialties") as {
  getSpecialtiesRequest: jest.Mock;
  deleteSpecialtyRequest: jest.Mock;
};

function mountView() {
  return shallowMount(SpecialtiesView, {
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
    ],
  });
}

describe("SpecialtiesView.vue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads specialties on mount", async () => {
    getSpecialtiesRequest.mockResolvedValueOnce([{ id: 1, name: "Cardio" }]);
    const wrapper = mountView();
    await flushPromises();
    expect(getSpecialtiesRequest).toHaveBeenCalled();
    expect((wrapper.vm as any).specialties).toHaveLength(1);
  });

  it("deletes a specialty and reloads list", async () => {
    getSpecialtiesRequest.mockResolvedValueOnce([]);
    const wrapper = mountView();
    await flushPromises();

    deleteSpecialtyRequest.mockResolvedValueOnce(undefined);
    getSpecialtiesRequest.mockResolvedValueOnce([{ id: 2, name: "Derma" }]);

    await (wrapper.vm as any).onDeleteSpecialty("2");
    expect(deleteSpecialtyRequest).toHaveBeenCalledWith("2");
    expect(getSpecialtiesRequest).toHaveBeenCalledTimes(2);
  });
});

