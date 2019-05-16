import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import NProgress from "nprogress";
import Router from "next/router";
import Order, { SINGLE_ORDER_QUERY } from "../components/Order";
import { CURRENT_USER_QUERY } from "../components/User";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";
import { fakeUser, fakeCartItem, fakeOrder } from "../lib/testUtils";
import { wrap } from "module";

const mocks = [
  {
    request: { query: SINGLE_ORDER_QUERY, variables: { id: "ord123" } },
    result: { data: { order: fakeOrder() } }
  }
];

describe("<Order", () => {
  it("renders the order", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <Order id="ord123" />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    const order = wrapper.find('div[data-test="order"]');
    expect(toJSON(order)).toMatchSnapshot();
  });
});
