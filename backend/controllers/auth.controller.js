const pool = require('../config/db');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const [rows] = await pool.query(
      `SELECT users.*, organizations.name AS org_name
       FROM users
       LEFT JOIN organizations ON users.org_id = organizations.id
       WHERE users.email = ?`,
      [email]
    );
    const user = rows[0];

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    req.session.userId = user.id;

    res.status(200).json({
      message: 'Logged in successfully',
      data: {
        id: user.id,
        org_id: user.org_id,
        name: user.name,
        email: user.email,
        role: user.role,
        org_name: user.org_name,
      },
    });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Failed to log in' });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error logging out:', err);
      return res.status(500).json({ error: 'Failed to log out' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logged out successfully' });
  });
};

const getCurrentUser = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const [rows] = await pool.query(
      `SELECT users.id, users.org_id, users.name, users.email, users.role, users.created_at,
              organizations.name AS org_name
       FROM users
       LEFT JOIN organizations ON users.org_id = organizations.id
       WHERE users.id = ?`,
      [req.session.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    res.status(200).json({ data: rows[0] });
  } catch (err) {
    console.error('Error fetching current user:', err);
    res.status(500).json({ error: 'Failed to fetch current user' });
  }
};

module.exports = { login, logout, getCurrentUser };
