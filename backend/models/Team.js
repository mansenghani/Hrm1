const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamName: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  department: { 
    type: String, 
    required: true 
  },
  managerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true });

// Ensure unique members? No, members can belong to multiple teams in some systems, 
// but per requirement: "Employee can only see own team" implies 1 team.
// We will handle consistency in the controller.

module.exports = mongoose.model('Team', teamSchema);
