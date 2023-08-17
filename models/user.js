const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    default: 'filiado' // Valor padrão
  },
  resetToken: String,
  resetTokenExpiration: Date,
  confirmationToken: {
    type: String,
    default: () => crypto.randomBytes(32).toString('hex')
  }
});

module.exports = mongoose.model('User', userSchema);