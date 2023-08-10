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
  cart: {
    items: [
      {
        noticiaId: {
          type: Schema.Types.ObjectId,
          ref: 'Noticia',
          required: true
        },
        quantity: { type: Number, required: true }
      }
    ]
  }
});

userSchema.methods.addToCart = function(noticia) {
  const cartNoticiaIndex = this.cart.items.findIndex(cp => {
    return cp.noticiaId.toString() === noticia._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartNoticiaIndex >= 0) {
    newQuantity = this.cart.items[cartNoticiaIndex].quantity + 1;
    updatedCartItems[cartNoticiaIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      noticiaId: noticia._id,
      quantity: newQuantity
    });
  }
  const updatedCart = {
    items: updatedCartItems
  };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeFromCart = function(noticiaId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.noticiaId.toString() !== noticiaId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function() {
  this.cart = { items: [] };
  return this.save();
};

module.exports = mongoose.model('User', userSchema);