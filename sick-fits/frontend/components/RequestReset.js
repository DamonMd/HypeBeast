import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";

const REQUEST_RESET = gql`
  mutation REQUEST_RESET($email: String!) {
    requestReset(email: $email) {
      message
    }
  }
`;

class RequestReset extends Component {
  state = {
    email: ""
  };

  handleChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  render() {
    return (
      <Mutation mutation={REQUEST_RESET} variables={this.state}>
        {(requestReset, { error, loading, called }) => {
          return (
            <Form
              method="post"
              onSubmit={async e => {
                e.preventDefault();
                const res = await requestReset();
              }}
            >
              <fieldset disabled={loading} aria-disabled={loading}>
                <h2>Request a Password Reset</h2>
                <Error error={error} />
                {!error && !loading && called && (
                  <p>Success! Please check your email for a reset link</p>
                )}
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

                <button type="submit">Reset</button>
              </fieldset>
            </Form>
          );
        }}
      </Mutation>
    );
  }
}

export default RequestReset;
