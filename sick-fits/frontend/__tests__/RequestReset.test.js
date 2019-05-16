import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import RequestReset, { REQUEST_RESET } from "../components/RequestReset";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";

const mocks = [
  {
    request: {
      query: REQUEST_RESET,
      variables: { email: "person@gmail.com" }
    },
    result: {
      data: { requestReset: { message: "success", __typename: "Message" } }
    }
  }
];

describe("<RequestReset/>", () => {
  it("renders and matches snapshot", () => {
    const wrapper = mount(
      <MockedProvider>
        <RequestReset />
      </MockedProvider>
    );
    const form = wrapper.find('form[data-test="form"]');
    expect(toJSON(form)).toMatchSnapshot();
  });

  it("calls the mutation", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <RequestReset />
      </MockedProvider>
    );
    //simulate typing an emal
    wrapper.find("input").simulate("change", {
      target: { name: "email", value: "person@gmail.com" }
    });
    wrapper.find("form").simulate("submit");
    await wait();
    wrapper.update();
    // expect(wrapper.find("p").text()).toContain(
    //   "Success! Please check your email for a reset link"
    // );
  });
});
