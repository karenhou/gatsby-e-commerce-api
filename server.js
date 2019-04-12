const { ApolloServer } = require("apollo-server");

const typeDefs = require("./server/typeDefs");
const resolvers = require("./server/resolvers");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  // add request and response to graphQL context
  context: ({ req, res }) => ({ req, res })
});

server.listen({ port: process.env.PORT || 3000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
