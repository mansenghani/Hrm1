require('dotenv').config({ path: 'C:/Users/HP/OneDrive/Desktop/ARYA/hrm/Hrm1/backend/.env' });
const mongoose = require('mongoose');
const Chat = require('C:/Users/HP/OneDrive/Desktop/ARYA/hrm/Hrm1/backend/models/Chat');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to DB');
    
    // Find any user to use as ID
    const User = require('C:/Users/HP/OneDrive/Desktop/ARYA/hrm/Hrm1/backend/models/User');
    const user = await User.findOne();
    const id = String(user._id);

    console.log(`Testing query for user: ${id}`);
    const chats = await Chat.find({ participants: id, deletedBy: { $ne: id } });
    console.log(`Found ${chats.length} chats`);
    
    // Log the chats with their participants and blockedBy
    chats.forEach(c => {
      console.log(`Chat ID: ${c._id}`);
      console.log(`  Participants:`, c.participants);
      console.log(`  Blocked By:`, c.blockedBy);
      console.log(`  Deleted By:`, c.deletedBy);
    });

    mongoose.disconnect();
  });
