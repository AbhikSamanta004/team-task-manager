const express = require('express');
const router = express.Router();
const { getProjects, getProjectById, createProject, addMember, removeMember, deleteProject } = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getProjects)
  .post(protect, createProject);

router.route('/:id')
  .get(protect, getProjectById)
  .delete(protect, deleteProject);

router.route('/:id/members')
  .put(protect, addMember);

router.route('/:id/members/:memberId')
  .delete(protect, removeMember);

module.exports = router;
