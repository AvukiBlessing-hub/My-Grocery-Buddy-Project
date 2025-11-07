require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const cors = require('cors');
const path = require('path');
const methodOverride = require('method-override');
const flash = require('connect-flash');

const authRoutes = require('./routes/authRoutes');
const User = require('./models/userModel');

const app = express();
const PORT = process.env.PORT || 3003;

// MongoDB connection
const mongoUrl = process.env.MONGODB_URL || process.env.MONGODB_URI;
mongoose.connect(mongoUrl, { useNewUrlParser: true })
  .then(() => console.log(' MongoDB connected successfully'))
  .catch(err => console.error(' MongoDB connection error:', err));

// View engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(flash());

// Static files
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'We are capable',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl, touchAfter: 24 * 3600 }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global middleware for user + flash
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  next();
});

// Routes
app.use('/', authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Error handler (shows full stack trace for debugging)
app.use((err, req, res, next) => {
  console.error(' Server error:', err);
  res.status(500).send(`<h1>Something went wrong!</h1><pre>${err.stack}</pre>`);
});

// Start server
app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));

module.exports = app;
