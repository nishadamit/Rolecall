const pool = require('../config/db');

const attachUser = async (req, res, next) => {
  try {
    if (req.session.userId) {
      const [rows] = await pool.query('SELECT id, org_id, role FROM users WHERE id = ?', [req.session.userId]);
      req.currentUser = rows[0] || null;
    } else {
      req.currentUser = null;
    }
    next();
  } catch (err) {
    console.error('Error attaching current user:', err);
    req.currentUser = null;
    next();
  }
};

module.exports = attachUser;
