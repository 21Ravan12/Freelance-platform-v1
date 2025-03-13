// db.js
const { MongoClient } = require('mongodb');
const { mongoUri, dbName } = require('./config');

let db;

const connectToDatabase = async () => {
  if (db) return db; 

  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db(dbName);
    console.log('Connected to MongoDB');
    return db;
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
};

const getDb = () => {
  if (!db) throw new Error('Database not connected');
  return db;
};

module.exports = { connectToDatabase, getDb };