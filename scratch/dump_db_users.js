const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend/.env' });

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hrms';
  console.log('Connecting to database:', uri);
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  
  // We want to query the relevant collections containing user accounts
  // Users, Admins, HRs, Managers, Employees, EmployeeUsers, etc.
  const collections = await db.listCollections().toArray();
  const colNames = collections.map(c => c.name);
  
  console.log('Available collections:', colNames.join(', '));
  
  // List of tables/collections to inspect for user credentials
  const targetCols = ['users', 'admins', 'hrs', 'managers', 'employees', 'employeeusers', 'employeusers'];
  
  const records = [];
  
  for (const colName of colNames) {
    if (targetCols.includes(colName.toLowerCase())) {
      const docs = await db.collection(colName).find({}).toArray();
      for (const doc of docs) {
        // Exclude profile-only collections unless they have credentials/role info
        // Let's filter out docs that represent profile expansions rather than credentials.
        // Usually credentials/user records have email or username.
        if (!doc.email && !doc.username && !doc.userId) continue;
        
        // Extract field values
        const id = doc._id ? doc._id.toString() : 'N/A';
        const email = doc.email || 'N/A';
        const name = doc.name || doc.fullName || (doc.profile && `${doc.profile.firstName || ''} ${doc.profile.lastName || ''}`.trim()) || 'N/A';
        const role = doc.role || colName.replace(/s$/, '').toLowerCase();
        
        let pwdHash = 'N/A';
        if (doc.password) {
          // Verify if bcrypt hash or otherwise
          if (doc.password.startsWith('$2a$') || doc.password.startsWith('$2b$') || doc.password.length > 30) {
            pwdHash = doc.password;
          } else {
            pwdHash = '[Hashed / Plaintext hidden]';
          }
        }
        
        records.push({
          sourceCollection: colName,
          id,
          name,
          email,
          role,
          pwdHash
        });
      }
    }
  }
  
  console.log('\n--- DATA EXTRACTED ---');
  console.log(JSON.stringify(records, null, 2));
  
  process.exit(0);
}

run().catch(console.error);
