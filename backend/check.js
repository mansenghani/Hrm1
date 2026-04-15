require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
   const dbs = mongoose.connection.db;
   const collections = await dbs.listCollections().toArray();
   let found = false;
   for (let c of collections) {
      const docs = await dbs.collection(c.name).find({ 
        $or: [
           {email: /mansenghani/i}, 
           {name: /mansenghani/i}, 
           {fullName: /mansenghani/i}, 
           {'profile.firstName': /mansenghani/i}, 
           {'profile.lastName': /mansenghani/i}
        ] 
      }).toArray();
      if (docs.length > 0) {
         console.log('--- FOUND IN COLLECTION ---', c.name);
         console.log(JSON.stringify(docs, null, 2));
         found = true;
      }
   }
   
   if (!found) {
       console.log('Did not find any data matching mansenghani in any collection.');
       console.log('Let us list collections:', collections.map(c => c.name));
       console.log('users count:', await dbs.collection('users').countDocuments());
       console.log('employees count:', await dbs.collection('employees').countDocuments());
       console.log('employeeusers count:', await dbs.collection('employeeusers').countDocuments());
   }
   console.log('Query complete');
   process.exit(0);
}).catch(console.error);
