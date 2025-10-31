const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const MongoStore = require("connect-mongo");
require("dotenv").config();

const User = require("./models/userModel");
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");

const app = express();

// Database Connection
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/grocery-app")
  .then(() => console.log(" Connected to MongoDB"))
  .catch((err) => console.error(" MongoDB connection error:", err));

// View Engine Setup
app.set("view engine", "pug");
app.set("views", "./views");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key-here",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI || "mongodb://localhost:27017/grocery-app"
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Flash Messages
app.use(flash());

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());

// CRITICAL: Configure passport to accept email OR username
passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, async (username, password, done) => {
  try {
    // Try to find user by email OR username
    const user = await User.findOne({
      $or: [{ email: username }, { username: username }]
    });
    
    if (!user) {
      return done(null, false, { message: 'Incorrect username or email' });
    }
    
    // Verify password using passport-local-mongoose method
    user.authenticate(password, (err, authenticated) => {
      if (err) return done(err);
      if (!authenticated) {
        return done(null, false, { message: 'Incorrect password' });
      }
      return done(null, user);
    });
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global Variables for Views
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.user = req.user;
  next();
});

// Routes
app.use("/", authRoutes);
app.use("/api", itemRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).send("404 - Page Not Found");
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});