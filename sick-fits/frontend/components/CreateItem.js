import React, { Component } from "react";
import Form from "./styles/Form";
import gql from "graphql-tag";
import Router from "next/router";
import { Mutation } from "react-apollo";
import Error from "./ErrorMessage";

const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $price: Int!
    $image: String
    $largeImage: String
  ) {
    createItem(
      title: $title
      description: $description
      price: $price
      image: $image
      largeImage: $largeImage
    ) {
      id
    }
  }
`;

class CreateItem extends Component {
  state = {
    title: "",
    description: "",
    price: 0,
    image: "",
    largeImage: ""
  };

  handleChange = e => {
    const { name, value, type } = e.target;
    const val = type === "number" ? parseFloat(value) : value;
    this.setState({ [name]: val });
  };

  uploadFile = async e => {
    const files = e.target.files;
    const data = new FormData();
    data.append("file", files[0]);
    //cloudinary config settings
    data.append("upload_preset", "hypebeast");
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dokwu1eus/image/upload",
      {
        method: "POST",
        body: data
      }
    );
    const file = await res.json();
    // const file = res;
    console.log(file);
    this.setState({
      image: file.secure_url,
      largeImage: file.eager[0].secure_url
    });
  };

  render() {
    const { title, price, description, image } = this.state;
    return (
      <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
        {(createItem, { loading, error }) => (
          <Form
            onSubmit={async e => {
              e.preventDefault();
              //TODO: add in check to make sure cloudinary has returned a response
              //call mutation
              const response = await createItem();
              //re-route to single item page
              console.log(response);
              Router.push({
                pathname: "/item",
                query: { item: response.data.createItem.id }
              });
            }}
          >
            <Error error={error} />
            <fieldset disabled={loading} aria-busy={loading}>
              <label htmlFor="title">Image</label>
              <input
                type="file"
                id="file"
                name="file"
                placeholder="Upload an image"
                onChange={this.uploadFile}
              />
              {this.state.image && (
                <img src={image} width="200" alt="Upload Preview" />
              )}
              <label htmlFor="title">Title</label>
              <input
                type="text"
                name="title"
                value={title}
                placeholder="Title"
                onChange={this.handleChange}
              />
              <label htmlFor="price">Price</label>
              <input
                type="number"
                name="price"
                value={price}
                onChange={this.handleChange}
              />
              <label htmlFor="description">Description</label>
              <textarea
                type="text"
                name="description"
                value={description}
                placeholder="Enter a description"
                onChange={this.handleChange}
              />
              <button type="submit">Submit</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default CreateItem;
export { CREATE_ITEM_MUTATION };
