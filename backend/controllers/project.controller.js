const pool = require('../config/db');

const getAllProjects = async (req, res) => {
  try {
    let query = `
      SELECT projects.*, users.name AS manager_name, users.role AS manager_role
      FROM projects
      LEFT JOIN users ON projects.manager_id = users.id
    `;
    const params = [];
    const user = req.currentUser;

    if (user?.role === 'org_admin') {
      query += ' WHERE projects.org_id = ?';
      params.push(user.org_id);
    } else if (user?.role === 'manager') {
      query += ' WHERE projects.manager_id = ?';
      params.push(user.id);
    } else if (user?.role === 'member') {
      query += `
        WHERE projects.manager_id = ?
           OR projects.id IN (SELECT project_id FROM project_members WHERE user_id = ?)
      `;
      params.push(user.id, user.id);
    }
    // super_admin, or no session: unscoped

    const [rows] = await pool.query(query, params);
    res.status(200).json({ data: rows });
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json({ data: rows[0] });
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

const createProject = async (req, res) => {
  try {
    const { org_id, manager_id, title, description } = req.body;

    if (!org_id || !manager_id || !title) {
      return res.status(400).json({ error: 'org_id, manager_id, and title are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO projects (org_id, manager_id, title, description) VALUES (?, ?, ?, ?)',
      [org_id, manager_id, title, description || null]
    );

    res.status(201).json({
      message: 'Project created successfully',
      data: { id: result.insertId, org_id, manager_id, title, description },
    });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { org_id, manager_id, title, description } = req.body;

    if (!org_id || !manager_id || !title) {
      return res.status(400).json({ error: 'org_id, manager_id, and title are required' });
    }

    const [result] = await pool.query(
      'UPDATE projects SET org_id = ?, manager_id = ?, title = ?, description = ? WHERE id = ?',
      [org_id, manager_id, title, description || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json({
      message: 'Project updated successfully',
      data: { id: Number(id), org_id, manager_id, title, description },
    });
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM projects WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
