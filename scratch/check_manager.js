const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const User = require('../backend/models/User');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ name: /Mission Echo/i }).populate('reportingManager', 'name email');
        
        if (user) {
            console.log(`Employee: ${user.name} (${user.email})`);
            if (user.reportingManager) {
                console.log(`Reporting Manager: ${user.reportingManager.name} (${user.reportingManager.email})`);
            } else {
                console.log('No direct reporting manager in User model.');
                // Check if they are in a team
                if (user.teamId) {
                    const Team = require('../backend/models/Team');
                    const team = await Team.findById(user.teamId).populate('managerId', 'name email');
                    if (team && team.managerId) {
                        console.log(`Team Manager (${team.name}): ${team.managerId.name} (${team.managerId.email})`);
                    } else {
                        console.log('Team has no manager assigned.');
                    }
                } else {
                    console.log('User is not assigned to any team.');
                }
            }
        } else {
            console.log('User "Mission Echo" not found.');
        }
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}

check();
