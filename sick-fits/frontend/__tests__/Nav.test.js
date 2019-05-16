import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import Nav from "../components/Nav";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";
import { fakeUser, fakeCartItem } from "../lib/testUtils";
import { CURRENT_USER_QUERY } from "../components/User";

const notSignedInMocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: { me: null }
    }
  }
];

const signedInMocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: { me: fakeUser() }
    }
  }
];

const signedInMocksWithCartItems = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: {
        me: {
          ...fakeUser(),
          cart: [fakeCartItem(), fakeCartItem(), fakeCartItem()]
        }
      }
    }
  }
];

describe("<Nav/>", () => {
  it("renders a sign in tab for logged out users", async () => {
    const wrapper = mount(
      <MockedProvider mocks={notSignedInMocks}>
        <Nav />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(wrapper.text()).toContain("Sign In");
    const nav = wrapper.find('[data-test="nav"]');
    expect(toJSON(nav)).toMatchSnapshot();
  });

  it("renders full nav when signed in", async () => {
    const wrapper = mount(
      <MockedProvider mocks={signedInMocks}>
        <Nav />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    const nav = wrapper.find('ul[data-test="nav"]');
    expect(nav.children().length).toBe(6);
    expect(nav.text()).toContain("Sign Out");
    // console.log(nav.debug());
  });

  //not really necessary since there is already a cart count test
  it("renders the amount of items in the cart", async () => {
    const wrapper = mount(
      <MockedProvider mocks={signedInMocksWithCartItems}>
        <Nav />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    const nav = wrapper.find('ul[data-test="nav"]');
    const count = nav.find("CartCount");
    // console.log(count.debug());
    expect(toJSON(count)).toMatchSnapshot();
  });
});
