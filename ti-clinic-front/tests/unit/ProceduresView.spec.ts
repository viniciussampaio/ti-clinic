import { shallowMount } from "@vue/test-utils";
import ProceduresView from "@/views/ProceduresView.vue";
import { flushPromises } from "./helpers/flush-promises";

jest.mock("@/services/procedures/procedures", () => ({
  getProceduresRequest: jest.fn(),
  createProcedureRequest: jest.fn(),
  updateProcedureRequest: jest.fn(),
  deleteProcedureRequest: jest.fn(),
}));

const {
  getProceduresRequest,
  deleteProcedureRequest,
} = jest.requireMock("@/services/procedures/procedures") as {
  getProceduresRequest: jest.Mock;
  deleteProcedureRequest: jest.Mock;
};

function mountView() {
  return shallowMount(ProceduresView, {
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

describe("ProceduresView.vue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads procedures on mount", async () => {
    getProceduresRequest.mockResolvedValueOnce([
      { id: 1, name: "ECG", price: "100" },
    ]);
    const wrapper = mountView();
    await flushPromises();
    expect(getProceduresRequest).toHaveBeenCalled();
    expect((wrapper.vm as any).procedures).toHaveLength(1);
  });

  it("deletes a procedure and reloads list", async () => {
    getProceduresRequest.mockResolvedValueOnce([]);
    const wrapper = mountView();
    await flushPromises();

    deleteProcedureRequest.mockResolvedValueOnce(undefined);
    getProceduresRequest.mockResolvedValueOnce([
      { id: 2, name: "Raio X", price: "200" },
    ]);

    await (wrapper.vm as any).onDeleteProcedure("2");
    expect(deleteProcedureRequest).toHaveBeenCalledWith("2");
    expect(getProceduresRequest).toHaveBeenCalledTimes(2);
  });
});

