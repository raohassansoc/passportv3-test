let mongoose = require("mongoose");
let Schema = mongoose.Schema;
const Currency = require("../Master/Currency");
const User = require("../Pay/User");

let SelfTransferSchema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  },
  currency1_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Currency,
  },
  currency1_qty: {
    type: Number,
    required: [true, "Please Provide the Quantity of currency 1 to transfer"],
  },
  currency1_current_valuation: {
    type: Number,
    required: [
      true,
      "Please Provide the Current currency value of currency1 being transfered",
    ],
  },
  currency2_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Currency,
  },
  currency2_qty: {
    type: Number,
    required: [
      true,
      "Please Provide the Quantity of currency 2 being transfered",
    ],
  },
  currency2_current_valuation: {
    type: Number,
    required: [
      true,
      "Please Provide the Current currency value of currency2 being transfered",
    ],
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

SelfTransferSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let SelfTransfer = mongoose.model("self_transfer", SelfTransferSchema);
module.exports = SelfTransfer;
