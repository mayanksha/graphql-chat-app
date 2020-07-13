/* eslint-disable import/first */
const React = require('react');
const ReactDOM = require('react-dom');

import { ApolloProvider, ApolloClient, split, HttpLink } from '@apollo/client'
import { WebSocketLink } from '@apollo/link-ws';

import { getMainDefinition } from '@apollo/client/utilities';
import { InMemoryCache } from '@apollo/client/cache';
import { BrowserRouter, Route, Link } from 'react-router-dom';

import App from "./App";
import Message from "./Message";

import "./index.css";

// Create an http link:
const httpLink = new HttpLink({
  uri: 'https://mayanksha-hasura-testing.herokuapp.com/v1/graphql',
  credentials: 'include',
  /* headers: {
   *   'x-hasura-admin-secret': `${process.env.REACT_APP_HASURA_ADMIN_SECRET}`
   * } */
});

// Create a WebSocket link:
const wsLink = new WebSocketLink({
  uri: `ws://mayanksha-hasura-testing.herokuapp.com/v1/graphql`,
  options: {
    reconnect: true,
    lazy: true,
    inactivityTimeout: 30000,
    /* connectionParams: async () => {
     *   return {
     *     headers: {
     *       'x-hasura-admin-secret': `${process.env.REACT_APP_HASURA_ADMIN_SECRET}`
     *     },
     *   }
     * }, */
  }
}); 

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({ query }) => {
    let definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  httpLink,
); 

const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
})

ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <div>
        <Route exact path="/" component={App} />
        <Route exact path="/chat" component={Message} />
      </div>
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById("root")
);
