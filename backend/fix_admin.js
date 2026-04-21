const mongoose = require('mongoose');
const User = require('./models/User');
const Employee = require('./models/Employee');
const dotenv = require('dotenv');

dotenv.config();

const fixAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hrms');
        console.log('✅ Connected');

        const email = 'admin@fluidhr.com';
        const password = '123123123123Man@'; // From seedAdmin.js

        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                name: 'System Admin',
                email,
                password,
                role: 'admin',
                status: 'active'
            });
            await user.save();
            console.log('🚀 Admin created in User collection');
        } else {
            user.password = password;
            user.role = 'admin';
            await user.save();
            console.log('🔄 Admin updated in User collection');
        }

        // Also ensure Employee profile exists for consistency
        let emp = await Employee.findOne({ email });
        if (!emp) {
            emp = new Employee({
                userId: user._id,
                email,
                fullName: 'System Admin',
                role: 'admin',
                employeeId: 'ADM-001'
            });
            await emp.save();
            console.log('👤 Admin Employee profile created');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixAdmin();
