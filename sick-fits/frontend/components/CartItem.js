import React from "react";
import formatMoney from "../lib/formatMoney";
import styled from "styled-components";
import PropTypes from "prop-types";
import RemoveFromCart from "./RemoveFromCart";

const CartItemStyles = styled.li`
  padding: 1rem 0;
  border-bottom: 1px solid ${props => props.theme.lightgrey};
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr auto;
  img {
    margin-right: 1rem;
  }
  h3,
  p {
    margin: 0;
  }
`;

const CartItem = props => {
  // 1. check if item exist on the site still
  if (!props.cartItem.item) {
    return (
      <CartItemStyles>
        <p>This product has been removed from the site</p>
        <RemoveFromCart id={props.cartItem.id} />
      </CartItemStyles>
    );
  }
  const { image, price, title, id, description } = props.cartItem.item;

  return (
    <CartItemStyles>
      <img width="100" src={image} alt={title} />
      <div className="cart-item-details">
        <h3>{title}</h3>
        <p>
          {formatMoney(price * props.cartItem.quantity)} {" - "}{" "}
          <em>
            {props.cartItem.quantity} &times; {formatMoney(price)}
          </em>
        </p>
      </div>
      <RemoveFromCart id={props.cartItem.id} />
    </CartItemStyles>
  );
};

CartItem.propTypes = {
  cartItem: PropTypes.object.isRequired
};

export default CartItem;
