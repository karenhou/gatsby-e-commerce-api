/* eslint consistent-return:0 */
const contentful = require("./contentful");
const async = require("async");
const stripe = require("stripe")(process.env.CONTENTFUL_PRIVATE_KEY);
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD
  }
});

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

      const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: `${args.customerEmail}`,
        subject: "Order Form",
        html: `<h3>Hello ${args.customerName}</h3>
        <p>Thanks for purchasing our product</p>
        <p>Your order number is ${args.orderId}</p>
        <p>You'll receive an email once payment confirmed and product is shipped</p>
        <p>Thanks again, Happy Shopping!</p>
        `
      };

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
        console.log("order ", order);
        try {
          await transporter.sendMail(mailOptions);
          console.log("email success");
        } catch (err) {
          console.log("email fail");
        }
        return order;
      } catch (error) {
        console.error("make order entry fail", error);
      }
      return order;
    },
    sendOrderEmail: async (parent, args) => {
      const { name, email, orderId } = args;
      const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: `${email}`,
        subject: "Order Form",
        html: `<h3>Hello ${name}</h3>
        <p>Thanks for purchasing our product</p>
        <p>Your order number is ${orderId}</p>
        <p>You'll receive another email once payment confirmed and product is shipped</p>
        <p>Thanks again, Happy Shopping!</p>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        return {
          status: "success",
          message: "Contact informaton sent successfully"
        };
      } catch (err) {
        return { status: "error", message: err.message };
      }
    }
  }
};
