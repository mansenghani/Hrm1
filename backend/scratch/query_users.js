require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined in the environment.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();

  const userCollections = ['admins', 'hrs', 'managers', 'users', 'employees', 'employeusers'];
  
  console.log('| User ID | Name/Username | Email | Role | Password Status / Hash |');
  console.log('|---|---|---|---|---|');

  for (let col of collections) {
    if (userCollections.includes(col.name)) {
      const docs = await db.collection(col.name).find({}).toArray();
      for (let doc of docs) {
        const userId = doc._id ? doc._id.toString() : 'N/A';
        const name = doc.name || doc.username || 'N/A';
        const email = doc.email || 'N/A';
        const role = doc.role || col.name.replace(/s$/, ''); // fallback to collection name minus 's'
        
        let pwdStatus = 'N/A';
        if (doc.password) {
          // Check if password looks like bcrypt hash
          if (doc.password.startsWith('$2a$') || doc.password.startsWith('$2b$') || doc.password.length > 30) {
            pwdStatus = `Hashed (Bcrypt: ${doc.password})`;
          } else {
            // Do not display plaintext passwords. Show only an indication.
            pwdStatus = 'Encrypted / Hashed (Plaintext Hidden)';
          }
        }
        
        console.log(`| ${userId} | ${name} | ${email} | ${role} | ${pwdStatus} |`);
      }
    }
  }

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
