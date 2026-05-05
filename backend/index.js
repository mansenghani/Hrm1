const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const taskRoutes = require('./routes/taskRoutes');
const personnelRoutes = require('./routes/personnelRoutes');
const timeTrackRoutes = require('./routes/timeTrackRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const managerRoutes = require('./routes/managerRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const path = require('path');

const http = require('http');
const { Server } = require('socket.io');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// ⚙️ Middleware
app.use(cors({
  origin: true, // Allow all origins during dev
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Attach io to app for use in controllers
app.set('io', io);

// 🔌 Socket.io Logic
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('⚡ User connected:', socket.id);

  socket.on('join_task', (taskId) => {
    socket.join(taskId);
    console.log(`📡 User joined task room: ${taskId}`);
  });

  socket.on('join_notifications', ({ userId, role }) => {
    if (!userId) return;
    socket.join(`user_${userId}`);
    if (role) socket.join(`role_${role}`);
    
    // Add to active users and broadcast
    activeUsers.set(userId, socket.id);
    io.emit('user_status_change', { userId, status: 'online' });
    
    console.log(`🔔 User joined notification rooms: user_${userId} ${role ? `role_${role}` : ''}`);
  });

  socket.on('get_online_users', () => {
    socket.emit('online_users', Array.from(activeUsers.keys()));
  });

  socket.on('mark_delivered', async ({ messageId, senderId }) => {
    try {
      const Message = require('./models/Message');
      await Message.findByIdAndUpdate(messageId, { status: 'delivered' });
      io.to(`user_${senderId}`).emit('message_delivered', { messageId });
    } catch (err) {
      console.error('Error marking message delivered:', err);
    }
  });

  socket.on('disconnect', () => {
    let disconnectedUserId = null;
    for (const [userId, sid] of activeUsers.entries()) {
      if (sid === socket.id) {
        disconnectedUserId = userId;
        activeUsers.delete(userId);
        break;
      }
    }
    if (disconnectedUserId) {
      io.emit('user_status_change', { userId: disconnectedUserId, status: 'offline' });
    }
    console.log('❌ User disconnected');
  });
});

// 🌍 Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/personnel', require('./routes/personnelRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/time', require('./routes/timeTrackRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/notifications', notificationRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/managers', managerRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'API is running' }));

// 🔌 Database Connection & Server Start
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hrms';
const PORT = process.env.PORT || 5000;

console.log('Connecting to MongoDB...');
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.error('❌ DB Connection Error:', err.message));

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
