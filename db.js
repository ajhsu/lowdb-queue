const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const fileAdapter = new FileSync('db.json');
const db = low(fileAdapter);

// Export database instance as a singleton object.
module.exports = db;