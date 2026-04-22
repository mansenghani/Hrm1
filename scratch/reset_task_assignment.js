require('dotenv').config({path:'backend/.env'});
const mongoose = require('mongoose');

async function resetAssignment() {
  await mongoose.connect(process.env.MONGODB_URI);
  // Clear the accidental assignment so the 'Delegate' box reappears
  await mongoose.connection.collection('tasks').updateMany({}, { 
    $set: { 
      assignedEmployee: null, 
      status: 'assigned' 
    } 
  });
  console.log('CLEANED: Accidental self-assignment removed. Delegate box restored.');
  process.exit(0);
}

resetAssignment();
