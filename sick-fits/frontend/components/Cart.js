import React from "react";
import SickButton from "./styles/SickButton";
import CartStyle from "./styles/CartStyles";
import Supreme from "./styles/Supreme";
import CloseButton from "./styles/CloseButton";

const Cart = () => {
  return (
    <CartStyle open={true}>
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
  );
};

export default Cart;
