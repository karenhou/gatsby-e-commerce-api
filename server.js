const { ApolloServer, gql } = require("apollo-server-express");
// const { ApolloServer, gql } = require("apollo-server");

const typeDefs = require("./server/typeDefs");
const resolvers = require("./server/resolvers");
const express = require("express");
const cors = require("cors");
const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
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

// app.listen({ port: process.env.PORT || 4000 }, url =>
//   console.log(`🚀 Server ready at ${url}`)
// );
const PORT = process.env.PORT || 3000;

// server.listen({ port: process.env.PORT || 3000 }).then(({ url }) => {
//   console.log(`🚀 Server ready at ${url}`);
// });
app.listen(PORT, "0.0.0.0", function() {
  console.log("Listening on Port 3000");
});
// server.listen({ port: process.env.PORT || 3000 }).then(({ url }) => {
//   console.log(`🚀 Server ready at ${url}`);
// });
