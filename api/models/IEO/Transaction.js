let mongoose = require("mongoose");
const User = require("../Pay/User");
let Schema = mongoose.Schema;

let TransactionSchema = new Schema({
  public_key: {
    type: String,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  },
  amount: {
    type: Schema.Types.Decimal128,
  },
  currency: {
    type: String,
  },
  is_crypto: {
    type: Boolean,
  },
  token_value: {
    type: Schema.Types.Decimal128,
  },
  equity: {
    type: Schema.Types.Decimal128,
  },
  bonus_equity: {
    type: Schema.Types.Decimal128,
  },
  is_type: {
    type: Boolean, //if true then IN else OUT
  },
  is_deleted: {
    type: Boolean,
  },
  deleted_at: {
    type: Date,
  },
  updated_at: {
    type: Date,
    default: Date,
  },
  created_at: {
    type: Date,
    default: Date,
  },
});

let Transaction = mongoose.model("users_transaction", TransactionSchema);
module.exports = Transaction;
