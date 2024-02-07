let mongoose = require("mongoose");
const Merchant = require("./Merchant");
const TimePeriod = require("./TimePeriod");
let Schema = mongoose.Schema;

let SettlementPeriodSchemas = new Schema({
  value: {
    type: Number,
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
    set: function (created_at) {
      return created_at.toISOString().split("T")[0];
    },
  },
});

let SettlementPeriod = mongoose.model(
  "merchant_settlement_period",
  SettlementPeriodSchemas
);
module.exports = SettlementPeriod;
