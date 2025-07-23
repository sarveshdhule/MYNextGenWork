const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const requestRoutes = require('./routes/request');
const { mongoURI } = require('./config');
const authRoutes = require('./routes/auth');
const opportunityRoutes = require('./routes/opportunities');
const commentRoutes = require('./routes/comment');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');
const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.options('*', cors());
app.use(express.json());

// Serve uploaded files (e.g., logos, images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ROUTES (all after CORS)
const registrationRoutes = require('./routes/registration');
app.use('/api/registrations', registrationRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
const notificationRoutes = require('./routes/notification');
app.use('/api/notifications', notificationRoutes);
const resourceRoutes = require('./routes/resources');
app.use('/api/resources', resourceRoutes);

app.use(errorHandler);

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const User = require('./models/User');

// Session setup (must be before passport)
app.use(session({ secret: 'your_secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ googleId: profile.id });
  if (!user) {
    user = await User.create({
      googleId: profile.id,
      username: profile.displayName,
      email: profile.emails[0].value,
      bookmarks: [] // ensure bookmarks is always an array
    });
  }
  return done(null, user);
}));

// Auth routes
app.get(
  '/api/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);
const { generateToken } = require('./controllers/authController');

app.get('/api/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`http://localhost:3000/google-success?token=${token}`);
  }
);

module.exports = app;