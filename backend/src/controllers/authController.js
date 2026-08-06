const db = require('../database/db');

const authController = {
  login: (req, res) => {
    const { username, password } = req.body;
    const admin = db.getAdmin();

    if (username === admin.username && password === admin.passwordHash) {
      return res.json({
        success: true,
        message: 'Authentication successful',
        token: 'khushi_auth_token_active',
        user: { username: admin.username }
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid username or password'
    });
  },

  updateCredentials: (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' });
    }
    const updated = db.updateAdmin({ username, passwordHash: password });
    return res.json({ success: true, message: 'Admin credentials updated', admin: { username: updated.username } });
  }
};

module.exports = authController;
