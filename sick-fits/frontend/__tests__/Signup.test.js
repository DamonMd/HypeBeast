import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import Signup, { SIGNUP_MUTATION } from "../components/Signup";
import { CURRENT_USER_QUERY } from "../components/User";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";
import { fakeUser } from "../lib/testUtils";
import { ApolloConsumer } from "react-apollo";

function type(wrapper, name, value) {
  wrapper.find(`input[name="${name}"]`).simulate("change", {
    target: { name, value }
  });
}

const me = fakeUser();
const mocks = [
  {
    // sign up mutation
    request: {
      query: SIGNUP_MUTATION,
      variables: {
        name: me.name,
        password: "wes",
        email: me.email
      }
    },
    result: {
      signup: {
        __typename: "User",
        id: "abc123",
        email: me.email,
        name: me.name
      }
    }
  },
  // current user mock
  {
    request: {
      query: CURRENT_USER_QUERY
    },
    result: { data: { me } }
  }
];

describe("<Signup/>", () => {
  it("renders and matches snapshot", async () => {
    const wrapper = mount(
      <MockedProvider>
        <Signup />
      </MockedProvider>
    );
    const form = wrapper.find('form[data-test="Signup"]');
    expect(toJSON(form)).toMatchSnapshot();
  });

  it("calls the mutation correctly", async () => {
    let apolloClient;
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <ApolloConsumer>
          {client => {
            apolloClient = client;
            return <Signup />;
          }}
        </ApolloConsumer>
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    type(wrapper, "name", me.name);
    type(wrapper, "email", me.email);
    type(wrapper, "password", "wes");
    wrapper.update();
    // wrapper.find("form").simulate("submit");
    // await wait();
    //query the user out of the apollo client
    const user = await apolloClient.query({ query: CURRENT_USER_QUERY });
  });
});
