# Team Task Manager

A modern Team Task Management application built for collaborative work. This full-stack web app enables users to register, create and join projects, assign tasks, and track progress with role-based access and dashboard analytics.

## Live Demo
- Frontend: https://team-task-manager-lemon-mu.vercel.app/login
- Backend API: https://team-task-manager-kjbe.onrender.com/api

## Key Features

- **Secure Authentication:** Sign up and log in using JWT-based authentication.
- **Role-Based Access Control:** Project creator becomes Admin, while team members have limited permissions.
  - **Admin:** Create projects, manage members, create tasks, assign tasks, update task details, delete tasks/projects.
  - **Member:** View assigned projects, update the status of their own tasks.
- **Project Management:** Create projects, invite members, remove members, and view project details.
- **Task Management:** Create tasks with title, description, due date, priority, and assignment.
- **Dashboard Analytics:** See total tasks, tasks by status, overdue tasks, and task distribution across users.
- **RESTful API Design:** Backend exposes clean API endpoints for auth, projects, tasks, and dashboard data.

## Tech Stack

- **Frontend:** React, Vite, React Router, Axios, React Icons
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs
- **Deployment:** Vercel (frontend) and Render (backend)

## Repository Structure

- `backend/` – Express server, API routes, MongoDB models, authentication middleware
- `frontend/` – React UI, pages, routing, authentication context, Axios API client

## API Endpoints

### Authentication
- `POST /api/auth/register` – Register new user
- `POST /api/auth/login` – Authenticate and receive JWT
- `GET /api/auth/profile` – Fetch current user profile
- `GET /api/auth/users` – Get available users for assignment

### Projects
- `GET /api/projects` – List projects for current user
- `POST /api/projects` – Create a new project
- `GET /api/projects/:id` – Get project details
- `PUT /api/projects/:id/members` – Add member to a project
- `DELETE /api/projects/:id/members/:memberId` – Remove member
- `DELETE /api/projects/:id` – Delete project (admin only)

### Tasks
- `GET /api/tasks` – List tasks assigned to the user or by project membership
- `POST /api/tasks` – Create task in a project (admin only)
- `GET /api/tasks/:id` – Get task details
- `PUT /api/tasks/:id` – Update task status/details
- `DELETE /api/tasks/:id` – Delete task (admin only)

### Dashboard
- `GET /api/dashboard/stats` – Fetch task stats for current user

## Local Setup

### Prerequisites
- Node.js (recommended latest LTS)
- MongoDB locally or MongoDB Atlas account

### Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in `backend/`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```
Start backend:
```bash
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env` file in `frontend/` if needed:
```env
VITE_API_URL=http://localhost:5000/api
```
Start frontend:
```bash
npm run dev
```
## Notes
- Admins are automatically assigned when they create a project.
- Members can only view the projects they belong to and update tasks assigned to them.
- Dashboard stats are personalized for the logged-in user.

