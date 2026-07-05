const pool = require('../config/db');

const getAllOrganizations = async (req, res) => {
  try {
    let query = `
      SELECT organizations.*,
             COUNT(DISTINCT users.id) AS user_count,
             COUNT(DISTINCT projects.id) AS project_count
      FROM organizations
      LEFT JOIN users ON users.org_id = organizations.id
      LEFT JOIN projects ON projects.org_id = organizations.id
    `;
    const params = [];
    const user = req.currentUser;

    if (user && user.role !== 'super_admin') {
      query += ' WHERE organizations.id = ?';
      params.push(user.org_id);
    }
    // super_admin, or no session: unscoped

    query += ' GROUP BY organizations.id';

    const [rows] = await pool.query(query, params);
    res.status(200).json({ data: rows });
  } catch (err) {
    console.error('Error fetching organizations:', err);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
};

const getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM organizations WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.status(200).json({ data: rows[0] });
  } catch (err) {
    console.error('Error fetching organization:', err);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
};

const createOrganization = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const [result] = await pool.query('INSERT INTO organizations (name) VALUES (?)', [name]);

    res.status(201).json({
      message: 'Organization created successfully',
      data: { id: result.insertId, name },
    });
  } catch (err) {
    console.error('Error creating organization:', err);
    res.status(500).json({ error: 'Failed to create organization' });
  }
};

const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const [result] = await pool.query('UPDATE organizations SET name = ? WHERE id = ?', [name, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.status(200).json({
      message: 'Organization updated successfully',
      data: { id: Number(id), name },
    });
  } catch (err) {
    console.error('Error updating organization:', err);
    res.status(500).json({ error: 'Failed to update organization' });
  }
};

const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM organizations WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.status(200).json({ message: 'Organization deleted successfully' });
  } catch (err) {
    console.error('Error deleting organization:', err);
    res.status(500).json({ error: 'Failed to delete organization' });
  }
};

module.exports = {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
};
