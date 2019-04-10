/* eslint consistent-return:0 */

const createClientManagement = require("contentful-management");
const underscore = require("underscore");
const dotenv = require("dotenv").config();

const config = {
  contenfulSpaceId: process.env.CONTENTFUL_SPACE_ID,
  contentfulManagementAccessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  envId: "master",
  contentfulTypeId: process.env.CONTENTFUL_CONTENT_TYPE_ID
};
const contentfulManagement = createClientManagement.createClient({
  accessToken: config.contentfulManagementAccessToken
});

// Helper functions

const parseAsset = data => {
  const createAssetData = assetData => {
    if (assetData.sys.type !== "Asset") {
      return undefined;
    }

    return {
      id: assetData.sys.id,
      createdAt: assetData.sys.createdAt,
      file: assetData.fields
        ? assetData.fields.file["en-US"] || assetData.fields.file
        : null,
      title: assetData.fields
        ? assetData.fields.title["en-US"] || assetData.fields.title
        : null
    };
  };

  if (underscore.isArray(data)) {
    const dataNormalized = data.map(item => createAssetData(item));
    return dataNormalized.filter(element => element !== undefined);
  }
  const returnData = createAssetData(data);
  return returnData || null;
};

const parseFields = fields => {
  const data = {};
  Object.keys(fields).map(key => {
    const value = fields[key];
    const valueLang = underscore.isObject(value) ? value["en-US"] : value;
    if (underscore.isObject(valueLang)) {
      // items link/image
      const assetData = parseAsset(valueLang);
      if (assetData !== null) {
        data[key] = assetData;
      }
    } else {
      data[key] = valueLang;
    }

    return null;
  });
  return data;
};

const parseResponse = (data, parseFieldsFunc = true) => {
  // console.log(JSON.stringify(data));
  return data.map(item => {
    const fields = parseFieldsFunc ? parseFields(item.fields) : item.fields;

    return {
      id: item.sys.id,
      spaceId: item.sys.space.sys.id,
      contentType: item.sys.contentType.sys.id,
      createdAt: item.sys.createdAt,
      updatedAt: item.sys.updatedAt,
      ...fields
    };
  });
};
const parseNewEntry = input => {
  const data = {};
  Object.keys(input).map(key => {
    const value = input[key];
    data[key] = { "en-US": value };
    return null;
  });
  return data;
};

/**
 * Get array of entries of requested content type
 * @param {*} contentType
 */
module.exports.getEntries = async (contentType, other) => {
  const space = await contentfulManagement.getSpace(config.contenfulSpaceId);
  const env = await space.getEnvironment(config.envId);
  const entries = await env.getEntries({
    // order: '-sys.createdAt',
    content_type: contentType,
    ...other
  });
  return parseResponse(entries.items);
};

/**
 * Get single entry by ID
 */
module.exports.getEntry = async id => {
  const space = await contentfulManagement.getSpace(config.contenfulSpaceId);
  const env = await space.getEnvironment(config.envId);
  const entry = await env.getEntry(id);
  return { id: entry.sys.id, ...parseFields(entry.fields) };
};

/**
 * Create new entry
 * @param {*} args Object of items
 * @param {*} contentType Entry name
 */
module.exports.createEntry = async args => {
  const space = await contentfulManagement.getSpace(config.contenfulSpaceId);
  const env = await space.getEnvironment(config.envId);
  const data = parseNewEntry(args);
  const entry = await env.createEntry(config.contentfulTypeId, {
    fields: data
  });
  const fields = parseFields(entry.fields);
  return {
    id: entry.sys.id,
    ...fields
  };
};

module.exports.updateEntry = async (id, value) => {
  const space = await contentfulManagement.getSpace(config.contenfulSpaceId);
  const env = await space.getEnvironment(config.envId);
  const entry = await env.getEntry(id);

  entry.fields.inventory["en-US"] += value;
  await entry.update();
  return { id: entry.sys.id, ...parseFields(entry.fields) };
};

module.exports.publishEntry = async id => {
  const space = await contentfulManagement.getSpace(config.contenfulSpaceId);
  const env = await space.getEnvironment(config.envId);
  const entry = await env.getEntry(id);

  // entry.fields.inventory["en-US"] += value;
  await entry.publish();
  return { id: entry.sys.id, ...parseFields(entry.fields) };
};

module.exports.createContentType = async args => {
  const space = await contentfulManagement.getSpace(config.contenfulSpaceId);
  const env = await space.getEnvironment(config.envId);
  // const data = parseNewEntry(args);
  const newContentType = await env.createContentType({
    name: "order",
    fields: [
      {
        id: "orderId",
        name: "Order Id",
        type: "Symbol",
        localized: false,
        required: false,
        validations: [],
        disabled: false,
        omitted: false
      },
      {
        id: "products",
        name: "Products",
        type: "Array",
        localized: false,
        required: false,
        items: {
          type: "Link",
          linkType: "Entry",
          validations: [
            {
              linkContentType: "products"
            }
          ]
        },
        disabled: false,
        omitted: false
      },
      {
        id: "status",
        name: "Status",
        type: "Symbol",
        localized: false,
        required: false,
        validations: [],
        disabled: false,
        omitted: false
      },
      {
        id: "subtotal",
        name: "Subtotal",
        type: "Symbol",
        localized: false,
        required: false,
        validations: [],
        disabled: false,
        omitted: false
      },
      {
        id: "shipping",
        name: "Shipping",
        type: "Symbol",
        localized: false,
        required: false,
        validations: [],
        disabled: false,
        omitted: false
      },
      {
        id: "tax",
        name: "Tax",
        type: "Symbol",
        localized: false,
        required: false,
        validations: [],
        disabled: false,
        omitted: false
      },
      {
        id: "total",
        name: "Total",
        type: "Symbol",
        localized: false,
        required: false,
        validations: [],
        disabled: false,
        omitted: false
      },
      {
        id: "customerName",
        name: "Customer Name",
        type: "Symbol",
        localized: false,
        required: false,
        validations: [],
        disabled: false,
        omitted: false
      },
      {
        id: "customerEmail",
        name: "Customer Email",
        type: "Symbol",
        localized: false,
        required: false,
        validations: [],
        disabled: false,
        omitted: false
      },
      {
        id: "customerTelephone",
        name: "Customer Telephone",
        type: "Symbol",
        localized: false,
        required: false,
        validations: [],
        disabled: false,
        omitted: false
      },
      {
        id: "customerAddress1",
        name: "Customer Address1",
        type: "Symbol",
        localized: false,
        required: false,
        validations: [],
        disabled: false,
        omitted: false
      },
      {
        id: "customerAddress2",
        name: "Customer Address2",
        type: "Symbol",
        localized: false,
        required: false,
        validations: [],
        disabled: false,
        omitted: false
      },
      {
        id: "customerCity",
        name: "Customer City",
        type: "Symbol",
        localized: false,
        required: false,
        validations: [],
        disabled: false,
        omitted: false
      },
      {
        id: "customerState",
        name: "Customer State",
        type: "Symbol",
        localized: false,
        required: false,
        validations: [],
        disabled: false,
        omitted: false
      },
      {
        id: "customerCountry",
        name: "Customer Country",
        type: "Symbol",
        localized: false,
        required: false,
        validations: [],
        disabled: false,
        omitted: false
      },
      {
        id: "customerPostcode",
        name: "Customer Postcode",
        type: "Symbol",
        localized: false,
        required: false,
        validations: [],
        disabled: false,
        omitted: false
      },
      {
        id: "customerNotes",
        name: "Customer Notes",
        type: "Text",
        localized: false,
        required: false,
        validations: [],
        disabled: false,
        omitted: false
      },
      {
        id: "createTime",
        name: "Create Time",
        type: "Symbol",
        localized: false,
        required: false,
        validations: [],
        disabled: false,
        omitted: false
      },
      {
        id: "notes",
        name: "Internal Notes",
        type: "Text",
        localized: false,
        required: false,
        validations: [],
        disabled: false,
        omitted: false
      },
      {
        id: "stripeId",
        name: "Stripe Id",
        type: "Symbol",
        localized: false,
        required: false,
        validations: [],
        disabled: false,
        omitted: false
      }
    ]
  });

  const fields = parseFields(newContentType.sys);
  // console.log(newContentType);
  return {
    id: newContentType.sys.id,
    ...fields
  };
};
