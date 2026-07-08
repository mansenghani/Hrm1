const Employee = require('../models/Employee');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const Task = require('../models/Task');
const User = require('../models/User');

exports.searchGlobal = async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) {
      return res.json({ employees: [], leaves: [], payroll: [], documents: [] });
    }

    const regex = new RegExp(q, 'i');

    // 1. Search Users first to map to leaves/payroll
    const users = await User.find({ name: regex }).select('_id');
    const userIds = users.map(u => u._id);

    // 2. Search Employees
    const employees = await Employee.find({
      $or: [
        { fullName: regex },
        { email: regex },
        { employeeId: regex },
        { position: regex }
      ]
    }).populate('userId', 'name email status role').limit(10);

    // 3. Search Leaves
    const leaves = await Leave.find({
      $or: [
        { user: { $in: userIds } },
        { leaveType: regex },
        { reason: regex },
        { status: regex }
      ]
    }).populate('user', 'name email').limit(10);

    // 4. Search Payroll
    const payroll = await Payroll.find({
      $or: [
        { user: { $in: userIds } },
        { month: regex },
        { year: regex },
        { status: regex }
      ]
    }).populate('user', 'name email').limit(10);

    // 5. Search Documents/Tasks
    // We search Tasks by title or description, and Task attachments for document names
    const tasks = await Task.find({
      $or: [
        { title: regex },
        { description: regex },
        { 'attachments.fileName': regex }
      ]
    }).limit(10);

    // Format documents from tasks and static matches
    const documents = [];
    tasks.forEach(t => {
      if (t.attachments && t.attachments.length > 0) {
        t.attachments.forEach(att => {
          if (regex.test(att.fileName)) {
            documents.push({
              id: att._id,
              name: att.fileName,
              type: att.fileType || 'pdf',
              url: att.fileUrl,
              taskTitle: t.title,
              date: att.uploadedAt ? new Date(att.uploadedAt).toLocaleDateString() : 'N/A'
            });
          }
        });
      }
    });

    // Add static dossier files matching
    const staticDocs = [
      { name: 'Offer letter.pdf', size: '182 KB', date: 'Mar 14, 2022', type: 'offer_letter' },
      { name: 'Employment contract.pdf', size: '254 KB', date: 'Mar 14, 2022', type: 'contract' },
      { name: 'ID Verification.pdf', size: '98 KB', date: 'Mar 16, 2022', type: 'id_proof' },
      { name: 'Tax form W-4.pdf', size: '64 KB', date: 'Jan 5, 2026', type: 'tax_form' }
    ];
    staticDocs.forEach(d => {
      if (regex.test(d.name)) {
        documents.push({
          id: d.type,
          name: d.name,
          type: 'pdf',
          size: d.size,
          date: d.date,
          isStatic: true
        });
      }
    });

    res.json({
      employees,
      leaves,
      payroll,
      documents
    });
  } catch (error) {
    console.error('Global search controller error:', error);
    res.status(500).json({ message: error.message });
  }
};
