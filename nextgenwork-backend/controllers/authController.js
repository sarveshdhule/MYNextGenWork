const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

const generateToken = (user) => {
  return jwt.sign(
    { _id: user._id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.generateToken = generateToken;

// Register
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Email already registered' });

    user = await User.findOne({ username });
    if (user) return res.status(400).json({ message: 'Username already taken' });

    user = new User({ username, email, password });
    await user.save();

    const token = generateToken(user);
    res.status(201).json({ token, user: { _id: user._id, username, email } });
  } catch (err) {
    next(err);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({ token, user: { _id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    next(err);
  }
};