import { Query } from "react-apollo";
import gql from "graphql-tag";
import PropTypes from "prop-types";
import SickButton from "./styles/SickButton";

const CURRENT_USER_QUERY = gql`
  query {
    me {
      id
      email
      name
      permissions
      cart {
        id
        quantity
        item {
          id
          price
          image
          title
          description
        }
      }
    }
  }
`;

const User = props => {
  return (
    <Query query={CURRENT_USER_QUERY}>
      {payload => props.children(payload)}
    </Query>
  );
};

const UserRights = props => {
  console.log("p", props);
  return (
    <tr>
      <td>{props.user.name}</td>
      <td>{props.user.email}</td>
      {props.permissions.map(p => (
        <td>
          <input type="checkbox" />
        </td>
      ))}
      <td>
        <SickButton>UPDATE</SickButton>
      </td>
      {/* {props.permissions.map(p => {
        return (
          <td>
            <label htmlFor={`${user.id}-permission-${p}`} />
            <input type="checkbox" />
          </td>
        );
      })} */}
    </tr>
  );
};

User.propTypes = {
  children: PropTypes.func.isRequired
};

export default User;
export { CURRENT_USER_QUERY };
export { UserRights };
