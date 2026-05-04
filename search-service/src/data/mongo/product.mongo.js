// data/mongo/product.mongo.js

import { MongoClient } from 'mongodb';

export class MongoProductRepository {
  async findAll() {
    const client = new MongoClient(process.env.MONGO_URL || 'mongodb://mongos-service:27017');

    try {
      await client.connect();
      const db = client.db(process.env.MONGO_DB || 'restaurantdb');
      return await db.collection('platos').find({}).toArray();
    } finally {
      await client.close();
    }
  }
}