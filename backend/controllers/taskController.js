const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get all tasks (with filters)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    let query = {};

    if (projectId) {
      query.project = projectId;
      const proj = await Project.findById(projectId);
      if (proj && proj.admin.toString() !== req.user._id.toString()) {
         query.assignedTo = req.user._id;
      }
    } else {
      query.assignedTo = req.user._id;
    }

    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignedTo', 'name email');

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('project', 'name')
            .populate('assignedTo', 'name email');
            
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Access control
        const proj = await Project.findById(task.project);
        const isAdmin = proj && proj.admin.toString() === req.user._id.toString();
        if (!isAdmin && task.assignedTo?._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this task' });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
  const { title, description, dueDate, priority, project, assignedTo } = req.body;

  try {
    // Verify project exists and user is project admin
    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ message: 'Project not found' });
    if (proj.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project creator can create tasks' });
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      project,
      assignedTo,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a task (status, assign, etc)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Role check
    const proj = await Project.findById(task.project);
    const isAdmin = proj && proj.admin.toString() === req.user._id.toString();

    if (!isAdmin) {
      // Member can only update tasks assigned to them, and typically only status
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }
      // Only allow updating status
      task.status = req.body.status || task.status;
    } else {
      // Admin can update anything
      task.title = req.body.title || task.title;
      task.description = req.body.description || task.description;
      task.status = req.body.status || task.status;
      task.priority = req.body.priority || task.priority;
      task.dueDate = req.body.dueDate || task.dueDate;
      task.assignedTo = req.body.assignedTo || task.assignedTo;
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const proj = await Project.findById(task.project);
    if (!proj || proj.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project creator can delete tasks' });
    }

    await task.remove();
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };
