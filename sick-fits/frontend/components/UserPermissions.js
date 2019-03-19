import React, { Component } from "react";
import PropTypes from "prop-types";
import SickButton from "./styles/SickButton";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Error from "./ErrorMessage";

const UPDATE_USER_PERMISSIONS = gql`
  mutation UPDATE_USER_PERMISSIONS($userId: ID!, $permissions: [Permission]) {
    updatePermissions(userId: $userId, permissions: $permissions) {
      id
      email
      name
      permissions
    }
  }
`;

class UserPermissions extends Component {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      id: PropTypes.string,
      permissions: PropTypes.array
    }).isRequired
  };

  state = {
    permissions: this.props.user.permissions
  };

  handleCheck = e => {
    let checkBox = e.target;
    let copyPerm = [...this.state.permissions];

    if (checkBox.checked) {
      copyPerm.push(checkBox.value);
    } else {
      copyPerm = copyPerm.filter(p => p !== checkBox.value);
    }
    this.setState({ permissions: copyPerm });
    console.log(copyPerm);
  };
  render() {
    const user = this.props.user;
    return (
      <Mutation
        mutation={UPDATE_USER_PERMISSIONS}
        variables={{ userId: user.id, permissions: this.state.permissions }}
      >
        {(updatePermissions, { loading, error }) => {
          {
            error && (
              <tr>
                <td colSpan="8">
                  <Error error={error} />
                </td>
              </tr>
            );
          }
          return (
            <tr>
              <td>{user.name}</td>
              <td>{user.email}</td>
              {this.props.possiblePermissions.map(p => (
                <td key={p}>
                  <label htmlFor={`${user.id}-permission-${p}`}>
                    <input
                      id={`${user.id}-permission-${p}`}
                      type="checkbox"
                      value={p}
                      checked={this.state.permissions.includes(p)}
                      onChange={this.handleCheck}
                    />
                  </label>
                </td>
              ))}
              <td>
                <SickButton
                  onClick={updatePermissions}
                  type="button"
                  disabled={loading}
                >
                  Updat{loading ? "ing" : "e"}
                </SickButton>
              </td>
            </tr>
          );
        }}
      </Mutation>
    );
  }
}

export default UserPermissions;
