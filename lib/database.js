import { MongoClient } from "mongodb"
import { ACES_DB, EVIDENCE_DB } from "config/mongo"

const uri = process.env.NODE_ENV === "development"
? process.env.MONGO_LOCAL
: process.env.MONGO_AWSGM2

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

export async function connect() {
  await client.connect()

  return { client }
}
