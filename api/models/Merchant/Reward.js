let mongoose = require("mongoose");
const Merchant = require("./Merchant");
let Schema = mongoose.Schema;

let RewardSchemas = new Schema({
  value: {
    type: Schema.Types.Decimal128,
  },
  merchant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Merchant,
    required: true,
    unique: [true, "Merchant with this id already has reward data."],
  },
  description: {
    type: String,
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

let Referral = mongoose.model("merchant_reward", RewardSchemas);
module.exports = Referral;
