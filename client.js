import { MongoClient } from 'mongodb';

let client = null;
let db = null;

export async function getMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return { client: null, db: null };
  if (db) return { client, db };
  client = new MongoClient(uri, { serverSelectionTimeoutMS: 3000 });
  await client.connect();
  db = client.db(); // use DB from URI
  return { client, db };
}
