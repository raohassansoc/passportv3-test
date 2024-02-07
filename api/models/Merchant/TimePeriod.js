let mongoose = require("mongoose");
const Merchant = require("./Merchant");
let Schema = mongoose.Schema;

let TimePeriodSchemas = new Schema({
  name: {
    type: String,
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

let TimePeriod = mongoose.model("merchant_time_period", TimePeriodSchemas);
module.exports = TimePeriod;
