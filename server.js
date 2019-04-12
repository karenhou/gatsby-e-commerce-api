const { ApolloServer, gql } = require("apollo-server-express");
const typeDefs = require("./server/typeDefs");
const resolvers = require("./server/resolvers");
const express = require("express");
const cors = require("cors");
const PORT = 4000;
const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  // add request and response to graphQL context
  context: ({ req, res }) => ({ req, res })
});

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  const { status } = err;
  res.status(status).json(err);
};

server.applyMiddleware({ app });

app.use(cors());
app.use(errorHandler);

app.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
