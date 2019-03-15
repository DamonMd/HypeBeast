import React, { Component } from "react";
import PropTypes from "prop-types";
import SickButton from "./styles/SickButton";
import { MUTATION } from "react-apollo";
import gql from "graphql-tag";

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
      <MUTATION
        mutation={UPDATE_USER_PERMISSIONS}
        variables={{ userId: user.id, permissions: this.state.permissions }}
      >
        {(updatePermissions, { loading, error }) => (
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
              <SickButton>UPDATE</SickButton>
            </td>
          </tr>
        )}
      </MUTATION>
    );
  }
}

UserPermissions.propTypes = {};

export default UserPermissions;
