let mongoose = require("mongoose");
let Schema = mongoose.Schema;
const Currency = require("../Master/Currency");
const User = require("../Pay/User");
const Merchant = require("../Merchant/Merchant");
const TransactionStatus = require("./TransactionStatus");
const QR = require("../QR/QR");

let TransactionSchema = new Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  },
  merchant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Merchant,
  },
  sender_public_key: {
    type: String,
  },
  sender_currency_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Currency,
  },
  sender_currency_qty: {
    type: Number,
    required: [
      true,
      "Please Provide the Quantity of currency transferd by sender",
    ],
  },
  sender_currency_current_valuation: {
    type: Number,
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  },
  receiver_public_key: {
    type: String,
  },
  cashback: {
    type: Schema.Types.Decimal128,
  },
  receiver_currency_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Currency,
  },
  receiver_currency_qty: {
    type: Number,
  },
  receiver_currency_current_valuation: {
    type: Number,
  },
  transaction_hash: {
    type: String,
    validate: {
      validator: function (value) {
        if (value) return /^0x[0-9a-fA-F]{64}$/.test(value);
      },
      message: "Invalid Transaction hash.",
    },
  },
  status_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: TransactionStatus,
  },
  status: {
    type: String,
    default: "pending",
  },
  is_merchant_payment: {
    type: Boolean,
    default: false,
  },
  qr_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: QR,
  },
  is_settled: {
    type: Boolean,
    default: false,
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

TransactionSchema.pre("save", async function (next) {
  try {
    if (this.transaction_hash) {
      const existingTransaction = await this.constructor.findOne({
        transaction_hash: this.transaction_hash,
      });

      if (existingTransaction) {
        const error = new Error("Transaction hash already exists.");
        next(error);
      } else {
        next();
      }
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
});

TransactionSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let Transaction = mongoose.model("transaction_history", TransactionSchema);
module.exports = Transaction;
