import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";
import { CURRENT_USER_QUERY } from "./User";

const RESET_PASSWORD = gql`
  mutation RESET_PASSWORD(
    $password: String!
    $confirmPassword: String!
    $resetToken: String!
  ) {
    resetPassword(
      password: $password
      confirmPassword: $confirmPassword
      resetToken: $resetToken
    ) {
      id
      name
      email
    }
  }
`;

class Reset extends Component {
  state = {
    password: "",
    confirmPassword: ""
  };

  handleChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  render() {
    const { confirmPassword, password } = this.state;
    return (
      <Mutation
        mutation={RESET_PASSWORD}
        variables={{
          password,
          confirmPassword,
          resetToken: this.props.resetToken
        }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(resetPassword, { error, loading, called }) => {
          return (
            <Form
              method="post"
              onSubmit={async e => {
                e.preventDefault();
                await resetPassword();
                this.setState({ password: "", confirmPassword: "" });
              }}
            >
              <fieldset disabled={loading} aria-disabled={loading}>
                <h2>Reset your password</h2>
                <Error error={error} />
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
                <label>
                  Confirm Password
                  <input
                    name="confirmPassword"
                    type="password"
                    placeholder="confirmPassword"
                    value={this.state.confirmPassword}
                    onChange={this.handleChange}
                  />
                </label>

                <button type="submit">Reset Your Password</button>
              </fieldset>
            </Form>
          );
        }}
      </Mutation>
    );
  }
}

export default Reset;
