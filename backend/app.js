const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const organizationRoutes = require('./routes/organization.routes');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const attachUser = require('./middleware/attachUser');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', secure: false },
  })
);
app.use(attachUser);

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/users', userRoutes);

module.exports = app;
