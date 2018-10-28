/**
 * modules/db.js
 *
 * Database initialization.
 */
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
/** Set the path for the DB */
const dbPath = path.resolve(__dirname, '../db/db.json');

/** Set the db adapter */
const adapter = new FileSync(dbPath);
const db = low(adapter);

/** Exports */
exports = module.exports = db;

/** Defaults */
db.defaults({
  documents: [],
  jobs: [],
  labs: [],
  refreshTokens: [],
  users: [],
  participants: []
}).write();
