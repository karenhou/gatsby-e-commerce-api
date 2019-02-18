const { ApolloServer, gql } = require("apollo-server-express");
const typeDefs = require("./server/typeDefs");
const resolvers = require("./server/resolvers");
const express = require("express");

const PORT = 4000;

const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  // add request and response to graphQL context
  context: ({ req, res }) => ({ req, res })
});
server.applyMiddleware({ app });

app.listen({ port: PORT }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);
// server.l
