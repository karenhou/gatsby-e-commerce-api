/* eslint consistent-return:0 */

const contentful = require("./contentful");
module.exports = {
  Query: {
    hello: () => "world",
    getProducts: async (_, { id }, { req, res }) => {
      const products = await contentful.getEntries("products");
      return products;
    },
    getProduct: async (_, { id }, { req, res }) => {
      // console.log(id);
      const product = await contentful.getEntry(id);
      return product;
    }
  },
  Mutation: {
    updateProductInventory: async (_, { id, value }, { req, res }) => {
      const product = await contentful.updateEntry(id, value);
      return product;
    },
    publishProductInventory: async (_, { id, value }, { req, res }) => {
      const publishProduct = await contentful.publishEntry(id, value);
      console.log(publishProduct);
      return publishProduct;
    }
  }
};
