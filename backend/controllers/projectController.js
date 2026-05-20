const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    // Users see projects where they are the admin OR a member
    const projects = await Project.find({
      $or: [{ admin: req.user._id }, { members: req.user._id }]
    })
      .populate('admin', 'name email')
      .populate('members', 'name email');
      
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('admin', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access
    if (project.admin._id.toString() !== req.user._id.toString() && !project.members.some(member => member._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res) => {
  const { name, description, members } = req.body;

  try {
    const project = await Project.create({
      name,
      description,
      admin: req.user._id,
      members: members || [],
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add member to project
// @route   PUT /api/projects/:id/members
// @access  Private/Admin
const addMember = async (req, res) => {
  const { memberId } = req.body;

  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project creator can add members' });
    }

    if (project.members.includes(memberId)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    project.members.push(memberId);
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project creator can delete it' });
    }

    // Delete associated tasks
    await Task.deleteMany({ project: project._id });
    await project.remove();

    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:memberId
// @access  Private/Admin
const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project creator can remove members' });
    }

    project.members = project.members.filter(
      (m) => m.toString() !== req.params.memberId
    );
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProjects, getProjectById, createProject, addMember, removeMember, deleteProject };
