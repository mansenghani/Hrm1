require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const dbs = mongoose.connection.db;
  const collections = await dbs.listCollections().toArray();

  for (let col of collections) {
    if (['admins', 'hrs', 'managers', 'users', 'employees'].includes(col.name)) {
      console.log(`\n=== Collection: ${col.name} ===`);
      const docs = await dbs.collection(col.name).find({}).toArray();
      console.log(JSON.stringify(docs.map(d => {
        // Exclude large fields or format them nicely
        const clean = { ...d };
        return clean;
      }), null, 2));
    }
  }

  process.exit(0);
}

run().catch(console.error);
