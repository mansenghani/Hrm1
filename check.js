const mongoose = require('mongoose');
require('./backend/models/Task');
mongoose.connect('mongodb://127.0.0.1:27017/hrms').then(async () => {
  const tasks = await mongoose.model('Task').find({'comments.0': {$exists: true}});
  console.log(JSON.stringify(tasks.map(t => t.comments), null, 2));
  process.exit(0);
});
