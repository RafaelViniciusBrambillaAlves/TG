import { MongoClient, Db, GridFSBucket } from "mongodb";

let db: Db;
let bucket: GridFSBucket;

export async function connectToMongo(uri: string, dbName: string) {
  const client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  bucket = new GridFSBucket(db, { bucketName: "uploads" });
  console.log("Mongo conectado");
}

export function getDb() {
  if (!db) throw new Error("Mongo não iniciado");
  return db;
}

export function getBucket() {
  if (!bucket) throw new Error("GridFSBucket não iniciado");
  return bucket;
}
