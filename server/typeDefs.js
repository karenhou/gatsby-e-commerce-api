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
  type Test {
    name: String
  }
  type Order {
    id: ID!
    product: Product
    orderId: String
    createTime: String
    customerCountry: String
    customerName: String
    customerAddress1: String
    customerAddress2: String
    customerCity: String
    customerState: String
    customerPostcode: String
    customerEmail: String
    customerTelephone: String
    customerNotes: String
  }

  type Query {
    hello: String
    getProducts: [Product]
    getProduct(id: String!): Product
  }
  type NewType {
    createdAt: String
  }
  type MailType {
    status: String
    message: String
  }

  type Mutation {
    testHello(id: String!): Test
    createType(id: String!): NewType
    updateProductInventory(id: String!, value: Int!): Product
    publishProductInventory(id: String!): Product
    sendOrderEmail(name: String!, email: String!, orderId: String!): MailType
    createOrder(
      tokenId: String!
      orderId: String!
      productIds: [String]!
      customerCountry: String!
      customerName: String!
      customerAddress1: String!
      customerAddress2: String
      customerCity: String!
      customerState: String!
      customerPostcode: String!
      customerEmail: String!
      customerTelephone: String!
      customerNotes: String
    ): Order
  }
`;
