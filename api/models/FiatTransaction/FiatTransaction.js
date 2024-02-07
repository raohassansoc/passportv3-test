let mongoose = require("mongoose");
let Schema = mongoose.Schema;
const Currency = require("../Master/Currency");
const User = require("../Pay/User");
const FiatTransactionType = require("./FiatTransactionType");

let FiatTransactionSchema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  },
  fiat_transaction_type_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: FiatTransactionType,
  },
  transffered_currency_name: {
    type: String,
  },
  transffered_currency_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Currency,
  },
  transffered_currency_qty: {
    type: Number,
  },
  stripe_charge_id: {
    type: String,
  },
  received_currency_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Currency,
  },
  received_currency_qty: {
    type: Number,
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

FiatTransactionSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let FiatTransaction = mongoose.model("fiat_transaction", FiatTransactionSchema);
module.exports = FiatTransaction;
