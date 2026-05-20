const Task = require('../models/Task');
const Project = require('../models/Project');

const getDashboardStats = async (req, res) => {
  try {
    // Stats for tasks assigned to the current user
    const query = { assignedTo: req.user._id };

    const totalTasks = await Task.countDocuments(query);
    const todoTasks = await Task.countDocuments({ ...query, status: 'To Do' });
    const inProgressTasks = await Task.countDocuments({ ...query, status: 'In Progress' });
    const doneTasks = await Task.countDocuments({ ...query, status: 'Done' });

    const now = new Date();
    const overdueTasks = await Task.countDocuments({ ...query, dueDate: { $lt: now }, status: { $ne: 'Done' } });

    // For any projects owned by this user, aggregate tasks per user
    const ownedProjects = await Project.find({ admin: req.user._id });
    const ownedProjectIds = ownedProjects.map(p => p._id);

    let tasksPerUser = [];
    if (ownedProjectIds.length > 0) {
      tasksPerUser = await Task.aggregate([
        { $match: { project: { $in: ownedProjectIds } } },
        { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        { $project: { name: { $ifNull: ['$user.name', 'Unassigned'] }, count: 1 } },
        { $sort: { count: -1 } }
      ]);
    }

    res.json({
      total: totalTasks,
      todo: todoTasks,
      inProgress: inProgressTasks,
      done: doneTasks,
      overdue: overdueTasks,
      tasksPerUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
