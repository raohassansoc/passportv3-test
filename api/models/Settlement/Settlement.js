const mongoose = require("mongoose");
const Transaction = require("../IEO/Transaction");
const SettlementType = require("./SettlementType");
const User = require("../Pay/User");
const Merchant = require("../Merchant/Merchant");
const Currency = require("../Master/Currency");
const Schema = mongoose.Schema;

let SettlementSchemas = new Schema({
  transaction_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Transaction,
    required: [
      true,
      "Please Provide Trasaction Reference for Settlement Details.",
    ],
  },
  settlement_transaction_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Transaction,
  },
  settlement_type_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: SettlementType,
    required: [
      true,
      "Please Provide Trasaction Reference for Settlement Details.",
    ],
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  },
  user_public_key: {
    type: String,
  },
  token_received_by_user: {
    type: Number,
  },
  merchant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Merchant,
  },
  merchant_public_key: {
    type: String,
  },
  merchant_tct_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Currency,
  }, // transaction currency type
  merchant_tc_qty: {
    type: Number,
  }, // transaction currency quantity
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

SettlementSchemas.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});
let Settlement = mongoose.model("settlement", SettlementSchemas);
module.exports = Settlement;
