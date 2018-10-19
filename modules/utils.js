/**
 * modules/utils.js
 *
 * Helper functions for the rest of the app
 */
const cuid = require('cuid');

const config = require('../config.js');

const BASE_PATH = config.basePath;
const RESOURCE = '/api/v1';

exports = module.exports = {
  makeURL: function(prefix, path, { resource } = {}) {
    resource = resource === undefined ? RESOURCE : resource;
    return `${BASE_PATH}${resource}/${prefix}/${path}/`;
  },
  handleSuccess: function(res, result, { status = 200 } = {}) {
    return res.status(status).json(result);
  },
  handleError: function(res, error) {
    if (error instanceof Error === true) {
      if (process.env.NODE_ENV === 'development') console.error(error);
      message = error.message;
    } else {
      console.log(error);
      message = error;
    }
    res.status(400).json({ error: message });
  },
  notFound: function(res) {
    console.error(err);
    res.status(404).send('Not Found');
  },
  noContent: function(res) {
    res.status(204).send();
  },
  makeList: function(type, items, { next, prev } = {}) {
    if (Array.isArray(items) === false) {
      throw new Error('"items" must be a list');
    }

    return {
      count: items.length,
      next: next !== null ? this.makeURL(type, next) : null,
      previous: prev !== null ? this.makeURL(type, prev) : null,
      items
    };
  },
  makeItem: function(type, data) {
    const id = cuid();
    return {
      id,
      created: new Date().toISOString(),
      type,
      url: this.makeURL(type, id),
      data
    };
  }
};
