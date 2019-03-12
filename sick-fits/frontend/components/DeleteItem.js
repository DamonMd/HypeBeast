import React, { Component } from "react";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import { ALL_ITEMS_QUERY } from "./Items";

const DELETE_ITEM_MUTATION = gql`
  mutation DELETE_ITEM_MUTATION($id: ID!) {
    deleteItem(id: $id) {
      id
    }
  }
`;

class DeleteItem extends Component {
  update = (cache, payload) => {
    //manually update the cache on client to match the server
    //read the cache for the items we want
    const data = cache.readQuery({ query: ALL_ITEMS_QUERY });
    console.log(data);
    console.log(payload);
    // filter deleted items out of the page
    data.items = data.items.filter(
      item => item.id !== payload.data.deleteItem.id
    );
    console.log("now the items areee....", data);
    cache.writeQuery({ query: ALL_ITEMS_QUERY, data: data });
  };

  render() {
    const { id } = this.props;
    return (
      <Mutation
        mutation={DELETE_ITEM_MUTATION}
        variables={{ id: id }}
        update={this.update}
      >
        {(deleteItem, { error }) => (
          <button
            onClick={() => {
              if (confirm("you sure about deleting this?")) {
                deleteItem();
              }
            }}
          >
            {this.props.children}
          </button>
        )}
      </Mutation>
    );
  }
}

export default DeleteItem;
