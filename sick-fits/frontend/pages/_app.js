import App, { Container } from "next/app";
import React from "react";
import Page from "../components/Page";
import { ApolloProvider } from "react-apollo";
import withData from "../lib/withData";

class MyApp extends App {
  //getInitialProps is a special nextJS lifecycle method that runs first
  //before the first render happens, and whatever is returned in the getInitialProps
  //function will be exposed as prop in the render area
  //will crawl every page for queries or mutations in that page
  //as every query will need to be fired off before you can render out the page
  //kind of like component did mount???
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};
    //if component that we are trying to render has props
    //surface them via the pageProps
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }
    //this exposes the query to the user
    pageProps.query = ctx.query;
    return { pageProps };
  }

  render() {
    const { Component, apollo, pageProps } = this.props;
    return (
      <Container>
        <ApolloProvider client={apollo}>
          <Page>
            <Component {...pageProps} />
          </Page>
        </ApolloProvider>
      </Container>
    );
  }
}

export default withData(MyApp);
