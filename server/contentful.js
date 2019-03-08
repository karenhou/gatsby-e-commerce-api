/* eslint consistent-return:0 */

const createClientManagement = require("contentful-management");
// import { createClient as createClientManagement } from "contentful-management";
// import { isObject, isArray } from "underscore";
const underscore = require("underscore");
const dotenv = require("dotenv").config();

const config = {
  contenfulSpaceId: process.env.CONTENTFUL_SPACE_ID,
  contentfulManagementAccessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  envId: "master"
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

const parseResponse = (data, parseFieldsFunc = true) =>
  // console.log(JSON.stringify(data));
  data.map(item => {
    const fields = parseFieldsFunc ? parseFields(item.fields) : item.fields;
    return {
      entryId: item.sys.id,
      spaceId: item.sys.space.sys.id,
      contentType: item.sys.contentType.sys.id,
      createdAt: item.sys.createdAt,
      updatedAt: item.sys.updatedAt,
      ...fields
    };
  });

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
module.exports.getEntries = async (contentType, envId) => {
  const space = await contentfulManagement.getSpace(config.contenfulSpaceId);
  const env = await space.getEnvironment(config.envId);
  const entries = await env.getEntries({
    // order: '-sys.createdAt',
    content_type: contentType,
    ...other
  });
  // console.log('entries', entries);
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
module.exports.createEntry = async (args, contentType) => {
  const space = await contentfulManagement.getSpace(config.contenfulSpaceId);
  const data = parseNewEntry(args);
  const entry = await space.createEntry(contentType, {
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

module.exports.publishEntry = async (id, value) => {
  const space = await contentfulManagement.getSpace(config.contenfulSpaceId);
  const env = await space.getEnvironment(config.envId);
  const entry = await env.getEntry(id);

  entry.fields.inventory["en-US"] += value;
  await entry.publish();
  return { id: entry.sys.id, ...parseFields(entry.fields) };
};
