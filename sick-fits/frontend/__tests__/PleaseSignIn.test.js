import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import PleaseSignIn from "../components/PleaseSignIn";
import { CURRENT_USER_QUERY } from "../components/User";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";
import { fakeUser } from "../lib/testUtils";

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

describe("<PleaseSignIn/>", () => {
  it("renders the sign in dialog for signed out users", async () => {
    const wrapper = mount(
      <MockedProvider mocks={notSignedInMocks}>
        <PleaseSignIn />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(wrapper.text()).toContain("Please sign in");
    const signIn = wrapper.find("Signin");
    expect(signIn.exists()).toBe(true);
  });

  it("renders the child component when the user is signed in", async () => {
    const Hey = () => {
      return <p>Hey!</p>;
    };
    const wrapper = mount(
      <MockedProvider mocks={signedInMocks}>
        <PleaseSignIn>
          <Hey />
        </PleaseSignIn>
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(wrapper.find("Hey").exists()).toBe(true);
    expect(wrapper.contains(<Hey />)).toBe(true);
  });
});
