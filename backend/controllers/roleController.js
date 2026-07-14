const Role = require('../models/Role');
const User = require('../models/User');

// Get all roles
exports.getRoles = async (req, res) => {
  try {
    let roles = await Role.find().sort({ createdAt: 1 });
    
    // Auto-seed if empty
    if (roles.length === 0) {
      const defaults = [
        {
          name: 'Super Admin',
          description: 'Full system access and configurations control.',
          usersCount: 2,
          status: 'Active',
          isSystem: true,
          tags: ['All access', 'Billing', 'Audit'],
          permissions: {
            Dashboard: ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Reject', 'Export', 'Import', 'Assign', 'Manage', 'Full Access'],
            Employees: ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Reject', 'Export', 'Import', 'Assign', 'Manage', 'Full Access'],
            Attendance: ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Reject', 'Export', 'Import', 'Assign', 'Manage', 'Full Access'],
            Leave: ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Reject', 'Export', 'Import', 'Assign', 'Manage', 'Full Access'],
            Payroll: ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Reject', 'Export', 'Import', 'Assign', 'Manage', 'Full Access'],
            Recruitment: ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Reject', 'Export', 'Import', 'Assign', 'Manage', 'Full Access'],
            Performance: ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Reject', 'Export', 'Import', 'Assign', 'Manage', 'Full Access'],
            Training: ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Reject', 'Export', 'Import', 'Assign', 'Manage', 'Full Access'],
            Reports: ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Reject', 'Export', 'Import', 'Assign', 'Manage', 'Full Access'],
            Departments: ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Reject', 'Export', 'Import', 'Assign', 'Manage', 'Full Access'],
            Designations: ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Reject', 'Export', 'Import', 'Assign', 'Manage', 'Full Access'],
            RolesPermissions: ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Reject', 'Export', 'Import', 'Assign', 'Manage', 'Full Access'],
            AuditLogs: ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Reject', 'Export', 'Import', 'Assign', 'Manage', 'Full Access'],
            Integrations: ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Reject', 'Export', 'Import', 'Assign', 'Manage', 'Full Access'],
            CompanySettings: ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Reject', 'Export', 'Import', 'Assign', 'Manage', 'Full Access']
          }
        },
        {
          name: 'HR Manager',
          description: 'Manage employees, recruitment, payroll and leaves.',
          usersCount: 5,
          status: 'Active',
          isSystem: true,
          tags: ['Employees', 'Leave', 'Recruitment', 'Reports'],
          permissions: {
            Dashboard: ['View'],
            Employees: ['View', 'Create', 'Edit', 'Export', 'Import'],
            Attendance: ['View', 'Edit', 'Approve', 'Reject', 'Export'],
            Leave: ['View', 'Approve', 'Reject'],
            Payroll: ['View', 'Create', 'Edit'],
            Recruitment: ['View', 'Create', 'Edit'],
            Performance: ['View', 'Edit'],
            Reports: ['View', 'Export']
          }
        },
        {
          name: 'Team Manager',
          description: 'Manage tasks and leaves for team members.',
          usersCount: 18,
          status: 'Active',
          isSystem: true,
          tags: ['Team', 'Approvals'],
          permissions: {
            Dashboard: ['View'],
            Employees: ['View'],
            Attendance: ['View', 'Approve', 'Reject'],
            Leave: ['View', 'Approve', 'Reject']
          }
        },
        {
          name: 'Employee',
          description: 'Self-service portal access for payroll and profile.',
          usersCount: 135,
          status: 'Active',
          isSystem: true,
          tags: ['Self-service'],
          permissions: {
            Dashboard: ['View'],
            Attendance: ['View'],
            Leave: ['View', 'Create']
          }
        }
      ];
      await Role.insertMany(defaults);
      roles = await Role.find().sort({ createdAt: 1 });
    }

    // Dynamically update usersCount based on real User counts
    const updatedRoles = await Promise.all(roles.map(async (role) => {
      let queryRole = role.name.toLowerCase().replace(' ', '');
      if (queryRole === 'superadmin') queryRole = 'admin';
      if (queryRole === 'hrmanager') queryRole = 'hr';
      if (queryRole === 'teammanager') queryRole = 'manager';
      
      const count = await User.countDocuments({ role: queryRole });
      if (count !== role.usersCount) {
        role.usersCount = count;
        await role.save();
      }
      return role;
    }));

    res.json(updatedRoles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a role
exports.createRole = async (req, res) => {
  try {
    const { name } = req.body;
    const existing = await Role.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Role with this name already exists' });
    }

    const role = new Role({
      ...req.body,
      isSystem: false,
      usersCount: 0
    });
    await role.save();
    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a role
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Prevent modifying name of system-default roles
    if (role.isSystem && req.body.name && req.body.name !== role.name) {
      return res.status(400).json({ message: 'Cannot rename system-default roles' });
    }

    // Update fields
    const allowedUpdates = ['description', 'status', 'permissions', 'tags'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        role[field] = req.body[field];
      }
    });

    if (!role.isSystem && req.body.name) {
      role.name = req.body.name;
    }

    await role.save();
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a role
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    if (role.isSystem) {
      return res.status(400).json({ message: 'System-default roles cannot be deleted' });
    }

    await Role.findByIdAndDelete(id);
    res.json({ message: 'Role deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Duplicate a role
exports.duplicateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const original = await Role.findById(id);
    if (!original) {
      return res.status(404).json({ message: 'Role not found' });
    }

    const copyData = original.toObject();
    delete copyData._id;
    delete copyData.createdAt;
    delete copyData.updatedAt;
    copyData.name = `${copyData.name} (Copy)`;
    copyData.isSystem = false;
    copyData.usersCount = 0;
    
    const copy = new Role(copyData);
    await copy.save();
    res.status(201).json(copy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
