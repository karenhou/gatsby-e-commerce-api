/* eslint consistent-return:0 */
const contentful = require("./contentful");
const async = require("async");
const stripe = require("stripe")(process.env.CONTENTFUL_PRIVATE_KEY);

module.exports = {
  Query: {
    hello: () => "world",
    getProducts: async (_, { id }, { req, res }) => {
      const products = await contentful.getEntries("products");
      return products;
    },
    getProduct: async (_, { id }, { req, res }) => {
      const product = await contentful.getEntry(id);
      return product;
    }
  },
  Mutation: {
    updateProductInventory: async (_, { id, value }, { req, res }) => {
      const product = await contentful.updateEntry(id, value);
      return product;
    },
    publishProductInventory: async (_, { id }, { req, res }) => {
      const publishProduct = await contentful.publishEntry(id);
      return publishProduct;
    },
    testHello: async (_, { id }, { req, res }) => {
      let temp = {
        name: "hello" + id
      };
      return temp;
    },
    createType: async (parent, args) => {
      const newType = await contentful.createContentType();
      return newType;
    },
    createOrder: async (parent, args) => {
      // get products
      const totalCost = await new Promise(resolve => {
        let total = 0;
        async.each(
          args.productIds,
          async (productId, callback) => {
            const product = await contentful.getEntry(productId);
            total += product.price;
            callback();
          },
          () => {
            resolve(total);
          }
        );
      });

      // process payment with stripe
      try {
        const charge = await stripe.charges.create({
          amount: totalCost * 100,
          currency: "usd",
          description: `Order by ${args.customerEmail} for test`,
          source: args.tokenId,
          receipt_email: args.customerEmail
        });
        args.stripeId = charge.id;
        args.status = charge.status;
        args.total = totalCost.toString();
      } catch (error) {
        console.error("payment error", error);
        throw new Error("Payment failed.");
      }

      // add to db
      // send array of products
      if (args.productIds) {
        args.products = args.productIds.map(item => ({
          sys: {
            type: "Link",
            linkType: "Entry",
            id: item
          }
        }));
      }

      delete args.tokenId;
      delete args.productIds;
      try {
        const order = await contentful.createEntry(args);
        console.log("success");
        return order;
      } catch (error) {
        console.error("make order entry fail", error);
      }
      return order;
    }
  }
};
