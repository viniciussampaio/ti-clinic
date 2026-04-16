import { shallowMount } from "@vue/test-utils";
import LoginView from "@/views/LoginView.vue";
import { flushPromises } from "./helpers/flush-promises";

function mountView(overrides?: {
  dispatch?: jest.Mock;
  replace?: jest.Mock;
}) {
  const dispatch = overrides?.dispatch ?? jest.fn();
  const replace = overrides?.replace ?? jest.fn();

  return shallowMount(LoginView, {
    mocks: {
      $store: { dispatch },
      $router: { replace },
      $route: { query: {} },
    },
  });
}

describe("LoginView.vue", () => {
  it("logs in and redirects", async () => {
    const dispatch = jest.fn().mockResolvedValue(undefined);
    const replace = jest.fn().mockResolvedValue(undefined);

    const wrapper = mountView({ dispatch, replace });
    const vm = wrapper.vm as any;
    vm.email = "a@a.com";
    vm.password = "123";

    await vm.onSubmit();
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith("login", {
      email: "a@a.com",
      password: "123",
    });
    expect(replace).toHaveBeenCalled();
  });

  it("shows error message when login fails", async () => {
    const dispatch = jest.fn().mockRejectedValue(new Error("fail"));
    const wrapper = mountView({ dispatch });
    const vm = wrapper.vm as any;
    vm.email = "a@a.com";
    vm.password = "123";

    await vm.onSubmit();
    await flushPromises();

    expect(vm.errorMessage).toBeTruthy();
  });
});

