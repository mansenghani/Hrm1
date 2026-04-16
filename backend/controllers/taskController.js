const Task = require('../models/Task');
const User = require('../models/User');

// --- ADMIN ACTIONS ---
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedToHR, priority, dueDate } = req.body;
    
    // Phase 1: Identity Integrity Guard
    if (!assignedToHR) return res.status(400).json({ message: 'Assignment Protocol Failed: Target HR Node must be specified.' });

    // Phase 2: Registry Verification
    const hr = await User.findOne({ _id: assignedToHR, role: 'hr' });
    if (!hr) return res.status(404).json({ message: 'Mission Targeted at Invalid HR Node: Connection Refused.' });

    console.log(`[TASK CREATION] Title: ${title} | Target HR: ${assignedToHR} | Creator: ${req.user.id}`);
    const task = new Task({
      title,
      description,
      assignedToHR,
      createdBy: req.user.id,
      priority,
      dueDate,
      status: 'created'
    });

    await task.save();
    console.log(`[TASK SAVED] Mission ID: ${task._id}`);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- HR ACTIONS ---
exports.getHRTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedToHR: req.user.id })
      .populate('createdBy', 'name email')
      .populate('forwardedToManager', 'name email');
    console.log(`[HR TASK FETCH] User: ${req.user.id} | Name: ${req.user.name} | Tasks Found: ${tasks.length}`);
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forwardToManager = async (req, res) => {
  try {
    const { managerId } = req.body;
    const task = await Task.findById(req.params.taskId);
    
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.assignedToHR.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    task.forwardedToManager = managerId;
    task.status = 'hr_review';
    await task.save();
    
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- MANAGER ACTIONS ---
exports.getManagerTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ forwardedToManager: req.user.id })
      .populate('assignedToHR', 'name email')
      .populate('assignedToEmployee', 'name email');
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.assignEmployee = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.forwardedToManager.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    task.assignedToEmployee = employeeId;
    task.status = 'manager_assigned';
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- EMPLOYEE ACTIONS ---
exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedToEmployee: req.user.id })
      .populate('forwardedToManager', 'name email');
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'in_progress' or 'completed'
    const task = await Task.findById(req.params.taskId);

    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.assignedToEmployee.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    task.status = status;
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- ADMIN UTILS ---
exports.getAllTasksAdmin = async (req, res) => {
    try {
      const tasks = await Task.find()
        .populate('assignedToHR', 'name email')
        .populate('forwardedToManager', 'name email')
        .populate('assignedToEmployee', 'name email');
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
      await Task.findByIdAndDelete(req.params.taskId);
      res.status(200).json({ message: 'Ejected' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};
