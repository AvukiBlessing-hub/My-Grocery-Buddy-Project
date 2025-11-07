const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true, minlength: 3, maxlength: 30 },
  email: { type: String, required: true, unique: true, lowercase: true, match: [/\S+@\S+\.\S+/, 'Invalid email'] },
  password: { type: String, required: true, minlength: 6 }
});

// Use passport-local-mongoose plugin for password hashing
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

module.exports = mongoose.model('User', userSchema);
