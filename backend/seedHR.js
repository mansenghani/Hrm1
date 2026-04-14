const mongoose = require('mongoose');
const dotenv = require('dotenv');
const HR = require('./models/HR');

dotenv.config();

const seedHR = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to DB for seeding HR');

    await HR.deleteMany({}); // Clear old HRs

    const hr = new HR({
      email: 'hr@fluidhr.com',
      password: 'hr@2026',
      role: 'hr',
      profile: { firstName: 'HR', lastName: 'Manager' }
    });

    await hr.save();
    console.log('🚀 HR seeded in the NEW HR FOLDER!');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedHR();
