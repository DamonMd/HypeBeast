import React, { Component } from "react";
import Form from "./styles/Form";
import gql from "graphql-tag";
import Router from "next/router";
import { Mutation, Query } from "react-apollo";
import Error from "./ErrorMessage";

const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      description
      price
    }
  }
`;

const UPDATE_ITEM_MUTATION = gql`
  mutation UPDATE_ITEM_MUTATION(
    $id: ID!
    $title: String
    $description: String
    $price: Int
  ) {
    updateItem(
      id: $id
      title: $title
      description: $description
      price: $price
    ) {
      id
      title
      description
      price
    }
  }
`;

class UpdateItem extends Component {
  state = {
    id: this.props.id
  };

  handleChange = e => {
    const { name, value, type } = e.target;
    const val = type === "number" ? parseFloat(value) : value;
    this.setState({ [name]: val });
  };

  updateItem = async (e, mutation) => {
    e.preventDefault();
    console.log("updating item");
    console.log(this.state);
    console.log(this.props.id);
    const response = await mutation({
      variables: {
        id: this.props.id,
        ...this.state
      }
    });
    console.log(response);
  };

  render() {
    const { title, price, description, image } = this.state;
    const { id } = this.props;
    return (
      <Query query={SINGLE_ITEM_QUERY} variables={{ id: id }}>
        {({ data, loading }) => {
          if (loading) {
            return <p>ReeeeLoaaading.....</p>;
          }
          if (!data.item) {
            return <p>No item found for {id} </p>;
          }
          return (
            <Mutation mutation={UPDATE_ITEM_MUTATION} variables={this.state}>
              {(updateItem, { loading, error }) => (
                <Form
                  onSubmit={e => {
                    this.updateItem(e, updateItem);
                  }}
                >
                  <Error error={error} />
                  <fieldset disabled={loading} aria-busy={loading}>
                    <label htmlFor="title">Title</label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={data.item.title}
                      placeholder="Title"
                      onChange={this.handleChange}
                    />
                    <label htmlFor="price">Price</label>
                    <input
                      type="number"
                      name="price"
                      defaultValue={data.item.price}
                      onChange={this.handleChange}
                    />
                    <label htmlFor="description">Description</label>
                    <textarea
                      type="text"
                      name="description"
                      defaultValue={data.item.description}
                      placeholder="Enter a description"
                      onChange={this.handleChange}
                    />
                    <button type="submit">
                      Sav{loading ? "ing" : "e"} Updates
                    </button>
                  </fieldset>
                </Form>
              )}
            </Mutation>
          );
        }}
      </Query>
    );
  }
}

export default UpdateItem;
export { UPDATE_ITEM_MUTATION };
