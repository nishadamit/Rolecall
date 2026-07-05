const pool = require('../config/db');

const getAllUsers = async (req, res) => {
  try {
    let query = `
      SELECT users.id, users.org_id, users.name, users.email, users.role, users.created_at,
             organizations.name AS org_name
      FROM users
      LEFT JOIN organizations ON users.org_id = organizations.id
    `;
    const params = [];
    const user = req.currentUser;

    if (user && user.role !== 'super_admin') {
      query += ' WHERE users.org_id = ?';
      params.push(user.org_id);
    }
    // super_admin, or no session: unscoped

    const [rows] = await pool.query(query, params);
    res.status(200).json({ data: rows });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT id, org_id, name, email, role, created_at FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ data: rows[0] });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

const createUser = async (req, res) => {
  try {
    const { org_id, name, email, role, password } = req.body;

    if (!org_id || !name || !email) {
      return res.status(400).json({ error: 'org_id, name, and email are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO users (org_id, name, email, role, password) VALUES (?, ?, ?, ?, ?)',
      [org_id, name, email, role || 'member', password || 'changeme123']
    );

    res.status(201).json({
      message: 'User created successfully',
      data: { id: result.insertId, org_id, name, email, role: role || 'member' },
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { org_id, name, email, role } = req.body;

    if (!org_id || !name || !email) {
      return res.status(400).json({ error: 'org_id, name, and email are required' });
    }

    const [result] = await pool.query(
      'UPDATE users SET org_id = ?, name = ?, email = ?, role = ? WHERE id = ?',
      [org_id, name, email, role || 'member', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'User updated successfully',
      data: { id: Number(id), org_id, name, email, role: role || 'member' },
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
