require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
   const dbs = mongoose.connection.db;
   const collections = await dbs.listCollections().toArray();
   let found = false;
   for (let c of collections) {
      const docs = await dbs.collection(c.name).find({ 
        $or: [
           {email: /bhavik/i}, 
           {name: /bhavik/i}, 
           {fullName: /bhavik/i}
        ] 
      }).toArray();
      if (docs.length > 0) {
         console.log('--- FOUND IN COLLECTION ---', c.name);
         console.log(JSON.stringify(docs, null, 2));
         found = true;
      }
   }
   
   if (!found) {
       console.log('Did not find any data matching bhavik in any collection.');
   }
   console.log('Query complete');
   process.exit(0);
}).catch(console.error);
