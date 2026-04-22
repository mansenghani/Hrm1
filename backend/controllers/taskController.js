const Task = require('../models/Task');
const User = require('../models/User');
const { createNotification } = require('../utils/notifications');

// --- HR ACTIONS ---
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedManager, priority, dueDate } = req.body;

    if (!assignedManager) return res.status(400).json({ message: 'Target Manager must be specified.' });

    const manager = await User.findOne({ _id: assignedManager, role: { $in: ['manager', 'hr'] } });
    if (!manager) return res.status(404).json({ message: 'Invalid Personnel node.' });

    const task = new Task({
      title,
      description,
      assignedManager,
      createdBy: req.user.id,
      priority,
      dueDate,
      status: 'assigned',
      attachments: req.file ? [{
        fileName: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`
      }] : []
    });

    await task.save();

    // Notify Manager
    await createNotification(assignedManager, `You have been assigned a new mission: ${title}`);

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- MANAGER ACTIONS ---
exports.getManagerTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedManager: req.user.id })
      .populate('createdBy', 'name email')
      .populate('assignedEmployee', 'name email')
      .populate('assignedEmployees', 'name email profileImage')
      .populate('comments.userId', 'name profileImage');
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

    const isAdminOrHR = ['admin', 'hr'].includes(req.user.role);
    const isAssignedManager = task.assignedManager?.toString() === req.user.id;

    if (!isAdminOrHR && !isAssignedManager) {
      return res.status(403).json({ message: 'Unauthorized to delegate this mission.' });
    }

    if (isAdminOrHR) {
      // HR/Admin assigns the Lead Manager (Single)
      task.assignedManager = employeeId;
      // Also set for legacy compatibility if needed
      task.assignedEmployee = employeeId;
    } else {
      // Managers delegate to Deployed Employees (Multiple)
      if (!task.assignedEmployees.includes(employeeId)) {
        task.assignedEmployees.push(employeeId);
      }
      task.assignedEmployee = employeeId; // Keep last assigned for single-ref UI
    }
    
    task.status = 'in_progress';
    await task.save();

    // Notify Personnel
    await createNotification(employeeId, `Strategic assignment received: ${task.title}. Report to your station.`);

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.unassignEmployee = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (!['admin', 'hr', 'manager'].includes(req.user.role)) return res.status(403).json({ message: 'Unauthorized' });

    task.assignedEmployees = task.assignedEmployees.filter(id => id.toString() !== employeeId);
    
    // If it was the Lead Manager, clear that field
    if (task.assignedManager?.toString() === employeeId) {
      task.assignedManager = null;
    }

    // If it was the legacy assignedEmployee, clear it or set to another one
    if (task.assignedEmployee?.toString() === employeeId) {
      task.assignedEmployee = task.assignedEmployees.length > 0 ? task.assignedEmployees[0] : null;
    }

    await task.save();
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task || task.assignedManager.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    task.status = 'completed';
    task.progress = 100;
    await task.save();

    // 📡 Socket.io Real-time Broadcast
    const io = req.app.get('io');
    if (io) {
      io.to(task._id.toString()).emit('task_updated', {
        taskId: task._id,
        updatedFields: { status: task.status, progress: task.progress }
      });
    }

    // Notify Employee
    await createNotification(task.assignedEmployee, `Mission Success: ${task.title} has been verified and closed.`);

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectTask = async (req, res) => {
  try {
    const { feedback } = req.body;
    const task = await Task.findById(req.params.taskId);
    if (!task || task.assignedManager.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    task.status = 'rework';
    task.feedback = feedback;
    await task.save();

    // 📡 Socket.io Real-time Broadcast
    const io = req.app.get('io');
    if (io) {
      io.to(task._id.toString()).emit('task_updated', {
        taskId: task._id,
        updatedFields: { status: task.status, feedback: task.feedback }
      });
    }

    // Notify Employee
    await createNotification(task.assignedEmployee, `Task Rejected: ${task.title}. Feedback: ${feedback}`);

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- EMPLOYEE ACTIONS ---
exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedEmployee: req.user.id })
      .populate('assignedManager', 'name email')
      .populate('assignedEmployees', 'name email')
      .populate('comments.userId', 'name profileImage');
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.assignedEmployee?.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    task.progress = progress;
    if (progress > 0 && task.status === 'rework') task.status = 'in_progress';
    await task.save();

    // 📡 Socket.io Real-time Broadcast
    const io = req.app.get('io');
    if (io) {
      io.to(task._id.toString()).emit('task_updated', {
        taskId: task._id,
        updatedFields: { progress: task.progress, status: task.status }
      });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.assignedEmployee?.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    task.status = 'submitted';
    await task.save();

    // 📡 Socket.io Real-time Broadcast
    const io = req.app.get('io');
    if (io) {
      io.to(task._id.toString()).emit('task_updated', {
        taskId: task._id,
        updatedFields: { status: task.status }
      });
    }

    // Notify Manager
    await createNotification(task.assignedManager, `Task telemetry received: ${task.title} submitted for review.`);

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadProof = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isLead = task.assignedManager?.toString() === req.user.id;
    const isAssignee = task.assignedEmployee?.toString() === req.user.id;

    if (!isLead && !isAssignee) return res.status(403).json({ message: 'Unauthorized' });

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    task.attachments.push({
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`
    });

    await task.save();

    // Notify Manager
    await createNotification(task.assignedManager, `New attachment uploaded for task: ${task.title}`);

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- COMMON ACTIONS ---
exports.addComment = async (req, res) => {
  try {
    const { message } = req.body;
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // 🔄 Ensure we have the latest profile image from DB
    const sender = await User.findById(req.user.id).select('profileImage name');

    const newComment = {
      userId: req.user.id,
      userName: sender.name || req.user.name || 'User',
      profileImage: sender.profileImage,
      role: req.user.role,
      message,
      createdAt: new Date()
    };

    task.comments.push(newComment);
    await task.save();

    // 📡 Socket.io Real-time Broadcast
    const io = req.app.get('io');
    if (io) {
      console.log(`📤 Emitting comment to room ${task._id}:`, message);
      io.to(task._id.toString()).emit('new_comment', {
        taskId: task._id,
        comment: newComment
      });
    }

    // Notify other party
    const recipientId = req.user.role === 'employee' ? task.assignedManager : task.assignedEmployee;
    if (recipientId) {
      await createNotification(recipientId, `New communication on task ${task.title}: ${message.substring(0, 30)}...`);
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- ADMIN / UTILS ---
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('createdBy', 'name email')
      .populate('assignedManager', 'name email')
      .populate('assignedEmployee', 'name email')
      .populate('assignedEmployees', 'name email profileImage')
      .populate('comments.userId', 'name profileImage');
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.taskId);
    res.status(200).json({ message: 'Protocol Ejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
