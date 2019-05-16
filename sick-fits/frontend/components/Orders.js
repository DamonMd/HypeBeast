import React, { Component } from "react";
import Error from "./ErrorMessage";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import PropTypes from "prop-types";
import formatMoney from "../lib/formatMoney";
import Link from "next/link";
import styled from "styled-components";
import OrderItemStyles from "./styles/OrderItemStyles";

const ORDERS_QUERY = gql`
  query ORDERS_QUERY {
    orders {
      id
      total
      items {
        id
        price
        image
        quantity
        description
        title
      }
    }
  }
`;

const OrderUl = styled.ul`
  display: grid;
  grid-gap: 4rem;
  grid-template-columns: repeat(auto-fit, minmax(40%, 1fr));
`;

class Orders extends Component {
  render() {
    return (
      <div>
        <Query query={ORDERS_QUERY}>
          {({ data, loading, error }) => {
            if (error) return <Error error={error} />;
            if (loading) return <p>loading....</p>;
            console.log("data from order query", data);
            const orders = data.orders;
            return (
              <div>
                <h2>You have {orders.length} orders</h2>
                <OrderUl>
                  {orders.map(order => {
                    return (
                      <OrderItemStyles key={order.id}>
                        <Link
                          href={{
                            pathname: "/order",
                            query: { id: order.id }
                          }}
                        >
                          <a>
                            <div className="order-meta">
                              <p>
                                {order.items.reduce(
                                  (a, b) => a + b.quantity,
                                  0
                                )}{" "}
                                Items
                              </p>
                              <p>{formatMoney(order.total)}</p>
                            </div>
                            <div className="images">
                              {order.items.map(item => {
                                return (
                                  <img
                                    key={item.id}
                                    src={item.image}
                                    alt={item.description}
                                  />
                                );
                              })}
                            </div>
                          </a>
                        </Link>
                      </OrderItemStyles>
                    );
                  })}
                </OrderUl>
              </div>
            );
          }}
        </Query>
      </div>
    );
  }
}

export default Orders;
