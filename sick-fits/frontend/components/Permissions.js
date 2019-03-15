import React, { Component } from "react";
import { Query, MUTATION } from "react-apollo";
import gql from "graphql-tag";
import Error from "./ErrorMessage";
import Table from "./styles/Table";
import UserPermissions from "./UserPermissions";

const possiblePermissions = [
  "ADMIN",
  "USER",
  "ITEMCREATE",
  "ITEMUPDATE",
  "ITEMDELETE",
  "PERMISSIONUPDATE"
];

const USER_PERMISSION_QUERY = gql`
  query {
    users {
      name
      email
      id
      permissions
    }
  }
`;

const Permissions = props => {
  return (
    <Query query={USER_PERMISSION_QUERY}>
      {({ data, loading, error }) => {
        console.log(data);
        if (loading) return <p>loading...</p>;
        return (
          <div>
            <Error error={error} />
            <div>
              <h2>Manage Permissions</h2>
              <Table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    {possiblePermissions.map((p, i) => (
                      <th key={i}>{p}</th>
                    ))}
                    <th>update</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map(user => (
                    <UserPermissions
                      key={user.id}
                      possiblePermissions={possiblePermissions}
                      user={user}
                    />
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        );
      }}
    </Query>
  );
};

export default Permissions;
