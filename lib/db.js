import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/xadrez';
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  console.warn('No MongoDB URI provided, using local MongoDB');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the connection across hot-reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, create a new connection
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise; 