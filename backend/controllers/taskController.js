const Task = require('../models/Task');
const HR = require('../models/HR');
const Manager = require('../models/Manager');
const EmployeeUser = require('../models/EmployeeUser');

// --- ADMIN ACTIONS ---
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedToHR, priority, dueDate } = req.body;
    
    const hr = await HR.findById(assignedToHR);
    if (!hr) return res.status(404).json({ message: 'Target HR Node not found.' });

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
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- HR ACTIONS ---
exports.getHRTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedToHR: req.user.id })
      .populate('createdBy', 'profile email')
      .populate('forwardedToManager', 'profile email');
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
      .populate('assignedToHR', 'profile email')
      .populate('assignedToEmployee', 'profile email');
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
      .populate('forwardedToManager', 'profile email');
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
        .populate('assignedToHR', 'profile email')
        .populate('forwardedToManager', 'profile email')
        .populate('assignedToEmployee', 'profile email');
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
