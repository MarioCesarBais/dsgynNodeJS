const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Make Mongoose use `findOneAndUpdate()`. Note that this option is `true`
// by default, you need to set it to false.
mongoose.set('useFindAndModify', false);


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