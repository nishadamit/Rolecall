const pool = require('../config/db');

const getAllTasks = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT tasks.*, users.name AS assigned_name
       FROM tasks
       LEFT JOIN users ON tasks.assigned_to = users.id`
    );
    res.status(200).json({ data: rows });
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({ data: rows[0] });
  } catch (err) {
    console.error('Error fetching task:', err);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

const createTask = async (req, res) => {
  try {
    const { project_id, assigned_to, title, status } = req.body;

    if (!project_id || !title) {
      return res.status(400).json({ error: 'project_id and title are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO tasks (project_id, assigned_to, title, status) VALUES (?, ?, ?, ?)',
      [project_id, assigned_to || null, title, status || 'todo']
    );

    res.status(201).json({
      message: 'Task created successfully',
      data: { id: result.insertId, project_id, assigned_to, title, status: status || 'todo' },
    });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { project_id, assigned_to, title, status } = req.body;

    if (!project_id || !title) {
      return res.status(400).json({ error: 'project_id and title are required' });
    }

    const [result] = await pool.query(
      'UPDATE tasks SET project_id = ?, assigned_to = ?, title = ?, status = ? WHERE id = ?',
      [project_id, assigned_to || null, title, status || 'todo', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({
      message: 'Task updated successfully',
      data: { id: Number(id), project_id, assigned_to, title, status: status || 'todo' },
    });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
