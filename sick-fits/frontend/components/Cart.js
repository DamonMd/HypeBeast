import React from "react";
import { Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import SickButton from "./styles/SickButton";
import CartStyle from "./styles/CartStyles";
import Supreme from "./styles/Supreme";
import CloseButton from "./styles/CloseButton";

const LOCAL_STATE_QUERY = gql`
  query {
    cartOpen @client
  }
`;

const TOGGLE_CART_MUTATION = gql`
  mutation {
    toggleCart @client
  }
`;

const Cart = () => {
  return (
    <Mutation mutation={TOGGLE_CART_MUTATION}>
      {toggleCart => (
        <Query query={LOCAL_STATE_QUERY}>
          {({ data }) => (
            <CartStyle open={data.cartOpen} onClick={toggleCart}>
              <header>
                <CloseButton title="close">&times;</CloseButton>
                <Supreme>Your Cart</Supreme>
                <p> you have ....... items in your cart</p>
              </header>
              <footer>
                <p>$92.10</p>
                <SickButton>Checkout</SickButton>
              </footer>
            </CartStyle>
          )}
        </Query>
      )}
    </Mutation>
  );
};

export default Cart;
export { LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION };
