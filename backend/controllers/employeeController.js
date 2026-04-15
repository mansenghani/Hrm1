const Employee = require('../models/Employee');
const User = require('../models/User');

// GET /api/employees
exports.getEmployees = async (req, res) => {
  try {
    const role = req.user.role;
    let query = {};
    
    // Role-based access logic for retrieving employees
    if (role === 'manager') {
      query.managerId = req.user.id;
    } else if (role === 'employee') {
      // Employees should only see themselves, or maybe they just use /me endpoint. If they hit this, return just their profile.
      query.userId = req.user.id;
    }

    const employees = await Employee.find(query)
      .populate('userId', 'name email status role')
      .populate('department', 'name')
      .populate('managerId', 'name email');

    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/employees/:id
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('userId', 'name email status role')
      .populate('department', 'name')
      .populate('managerId', 'name email');
      
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    
    // Role-based access logic
    if (req.user.role === 'manager' && employee.managerId?.toString() !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized to view this employee' });
    }
    if (req.user.role === 'employee' && employee.userId._id.toString() !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/employees
exports.createEmployee = async (req, res) => {
  try {
    const { email, password, fullName, role, ...employeeData } = req.body;
    
    // 1. Create User
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });
    
    const userRole = role || 'employee';
    
    let finalEmployeeId = employeeData.employeeId;
    if (!finalEmployeeId) {
       const prefix = userRole === 'admin' ? 'ADM' : userRole === 'hr' ? 'HR' : userRole === 'manager' ? 'MGR' : 'EMP';
       const count = await Employee.countDocuments();
       finalEmployeeId = `${prefix}-${String(count + 1).padStart(3, '0')}`;
    }
    
    const newUser = new User({
      name: fullName,
      email,
      password,
      role: userRole,
    });
    const savedUser = await newUser.save();
    
    // 2. Create Employee profile
    const newEmployee = new Employee({
      userId: savedUser._id,
      email,
      fullName,
      role: userRole,
      ...employeeData,
      employeeId: finalEmployeeId
    });
    
    const savedEmployee = await newEmployee.save();
    res.status(201).json(savedEmployee);
  } catch (error) {
    console.error('Create Employee Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/employees/:id
exports.updateEmployee = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    
    // Ensure office email cannot be modified after creation
    if (updateData.email) {
      delete updateData.email;
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    
    const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    // Also update User if name or role changed (email is now locked)
    if (updateData.fullName || updateData.role) {
       const userUpdate = {};
       if (updateData.fullName) userUpdate.name = updateData.fullName;
       if (updateData.role) userUpdate.role = updateData.role;
       await User.findByIdAndUpdate(employee.userId, userUpdate);
    }
    
    res.json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/employees/:id (Soft delete per requirement)
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    
    employee.status = 'inactive';
    await employee.save();
    
    await User.findByIdAndUpdate(employee.userId, { status: 'inactive' });
    res.json({ message: 'Employee marked as inactive' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/employees/:id/status
exports.updateEmployeeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
       return res.status(400).json({ message: 'Invalid status' });
    }
    
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    
    employee.status = status;
    await employee.save();
    
    await User.findByIdAndUpdate(employee.userId, { status });
    res.json({ message: `Employee status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/employees/manager/:managerId
exports.getEmployeesByManager = async (req, res) => {
  try {
    const employees = await Employee.find({ managerId: req.params.managerId })
      .populate('department', 'name');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
