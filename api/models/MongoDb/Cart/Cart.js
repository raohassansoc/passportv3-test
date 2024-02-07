let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let CartSchema = new Schema({
  items: [
    {
      product_id: {
        type: Number,
      },
      quantity: {
        type: Number,
      },
      product_variants_id: {
        type: Number,
      },
      amount: {
        type: String,
      },
      image: {
        type: String,
      },
      name: {
        type: String,
      },
    },
  ],
  user_id: {
    type: Number,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

let Cart = mongoose.model("Cart", CartSchema);
module.exports = Cart;
