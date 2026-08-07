const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

const authController = {
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }

      const isMatch = await user.verifyPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }

      user.lastLogin = new Date();
      await user.save();

      const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, env.jwtSecret, { expiresIn: '1d' });

      // Set HTTP-Only cookie for Enterprise-grade security (prevents XSS reading the token)
      res.cookie('khushi_auth_token', token, {
        httpOnly: true,
        secure: env.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      return res.json({
        success: true,
        message: 'Authentication successful',
        user: { username: user.username, role: user.role, name: user.name }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error during login' });
    }
  },

  logout: (req, res) => {
    res.clearCookie('khushi_auth_token');
    return res.json({ success: true, message: 'Logged out successfully' });
  },

  updateCredentials: async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password required' });
      }
      
      const userId = req.user.id;
      const user = await User.findById(userId);
      
      const bcrypt = require('bcryptjs');
      user.username = username;
      user.passwordHash = await bcrypt.hash(password, 10);
      await user.save();
      
      return res.json({ success: true, message: 'Credentials updated', user: { username: user.username } });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to update credentials' });
    }
  }
};

module.exports = authController;
