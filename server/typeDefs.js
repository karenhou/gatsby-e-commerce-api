// The GraphQL schema
const { gql } = require("apollo-server");

module.exports = gql`
  type Product {
    id: ID!
    spaceId: String
    contentType: String
    name: String
    description: String
    price: Float
    inventory: Int
  }

  type Query {
    "A simple type for getting started!"
    hello: String
    getProducts: [Product]
    getProduct(id: String!): Product
  }
`;
