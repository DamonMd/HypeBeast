import React from "react";
import Link from "next/link";
import { Mutation } from "react-apollo";
import NavStyles from "./styles/NavStyles";
import User from "./User";
import Signout from "./Signout";
import { TOGGLE_CART_MUTATION } from "./Cart";
import CartCount from "./CartCount";

const Nav = () => {
  return (
    <User>
      {({ data: { me } }) => (
        <NavStyles data-test="nav">
          <Link href="/items">
            <a>shop</a>
          </Link>
          {me && (
            <>
              <Link href="/sell">
                <a>Sell</a>
              </Link>
              <Link href="/orders">
                <a>orders</a>
              </Link>
              <Link href="/me">
                <a>account</a>
              </Link>
              <Signout />
              <Mutation mutation={TOGGLE_CART_MUTATION}>
                {toggleCart => (
                  <button onClick={toggleCart}>
                    My Cart{" "}
                    <CartCount
                      count={me.cart.reduce((total, cart) => {
                        return total + cart.quantity;
                      }, 0)}
                    />
                  </button>
                )}
              </Mutation>
            </>
          )}
          {!me && (
            <Link href="/signup">
              <a>Sign In</a>
            </Link>
          )}
        </NavStyles>
      )}
    </User>
  );
};

export default Nav;
