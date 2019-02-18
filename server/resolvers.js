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
  }
};
