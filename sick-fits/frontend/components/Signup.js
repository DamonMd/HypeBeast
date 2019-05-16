import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";
import { CURRENT_USER_QUERY } from "./User";

const SIGNUP_MUTATION = gql`
  mutation SIGNUP_MUTATION(
    $name: String!
    $email: String!
    $password: String!
  ) {
    signup(name: $name, email: $email, password: $password) {
      id
      email
    }
  }
`;

class Signup extends Component {
  state = {
    name: "",
    password: "",
    email: ""
  };

  handleChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  submitForm = e => {
    e.preventDefault();
    console.log("idk");
  };

  render() {
    return (
      <Mutation
        mutation={SIGNUP_MUTATION}
        variables={this.state}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(signup, { error, loading }) => {
          return (
            <Form
              data-test="Signup"
              method="post"
              onSubmit={async e => {
                e.preventDefault();
                const res = await signup();
              }}
            >
              <fieldset disabled={loading} aria-disabled={loading}>
                <h2>Sign up for an account</h2>
                <Error error={error} />
                <label>
                  Name
                  <input
                    name="name"
                    type="text"
                    placeholder="name"
                    value={this.state.name}
                    onChange={this.handleChange}
                  />
                </label>

                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    placeholder="email"
                    value={this.state.email}
                    onChange={this.handleChange}
                  />
                </label>

                <label>
                  Password
                  <input
                    name="password"
                    type="password"
                    placeholder="password"
                    value={this.state.password}
                    onChange={this.handleChange}
                  />
                </label>

                <button type="submit">Sign Up!</button>
              </fieldset>
            </Form>
          );
        }}
      </Mutation>
    );
  }
}

export default Signup;
export { SIGNUP_MUTATION };
