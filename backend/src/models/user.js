const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, min: 0 },
  userID: { type: String, required: true, unique: true },
  role: { type: String, default: 'user' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
