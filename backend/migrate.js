require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./models/User');
const Employee = require('./models/Employee');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('Connected. Starting migration...');
    const dbs = mongoose.connection.db;

    const collectionsToMigrate = [
        { label: 'employeeusers', defaultRole: 'employee' },
        { label: 'admins', defaultRole: 'admin' },
        { label: 'managers', defaultRole: 'manager' },
        { label: 'hrs', defaultRole: 'hr' }
    ];

    for (const collInfo of collectionsToMigrate) {
        const oldDocs = await dbs.collection(collInfo.label).find({}).toArray();
        console.log(`Migrating ${oldDocs.length} records from ${collInfo.label}...`);

        for (const doc of oldDocs) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: doc.email });
            if (existingUser) {
                console.log(`Skipping ${doc.email} - User already exists.`);
                continue;
            }

            const role = doc.role || collInfo.defaultRole;
            const firstName = doc.profile?.firstName || 'Unknown';
            const lastName = doc.profile?.lastName || '';
            const fullName = `${firstName} ${lastName}`.trim();

            // Insert into unified User
            const newUser = new User({
                _id: doc._id, // Retain ID for relationships
                name: fullName,
                email: doc.email,
                password: doc.password, // Assume it's already hashed
                role: role,
                status: 'active'
            });

            // Prevent re-hashing in pre-save if we bypass it, but actually `isModified` covers us.
            // Let's use Model.collection.insertOne to bypass the pre-save hook re-hashing
            await User.collection.insertOne(newUser.toObject());

            // Prepare employee ID
            const prefix = role === 'admin' ? 'ADM' : role === 'hr' ? 'HR' : role === 'manager' ? 'MGR' : 'EMP';
             
            // Try to pull existing count directly with raw mongo so it is fast
            const count = await dbs.collection('employees').countDocuments();
            const finalEmployeeId = `${prefix}-${String(count + 1).padStart(3, '0')}`;

            // Create Employee Profile
            const empDoc = {
                userId: doc._id,
                employeeId: finalEmployeeId,
                fullName: fullName,
                email: doc.email,
                role: role,
                status: 'active',
                joinDate: doc.createdAt || new Date(),
                createdAt: doc.createdAt || new Date(),
                updatedAt: doc.updatedAt || new Date()
            };

            await dbs.collection('employees').insertOne(empDoc);
            console.log(`Migrated: ${doc.email} as ${finalEmployeeId}`);
        }
    }

    console.log('Migration completed successfully!');
    process.exit(0);

}).catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
