let mongoose = require("mongoose");
const Merchant = require("./Merchant");
let Schema = mongoose.Schema;

let ReferralSchemas = new Schema({
  value: {
    type: Schema.Types.Decimal128,
  },
  merchant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Merchant,
    required: true,
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

let Referral = mongoose.model("merchant_referral", ReferralSchemas);
module.exports = Referral;
