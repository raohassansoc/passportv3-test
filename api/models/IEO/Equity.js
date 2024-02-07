let mongoose = require("mongoose");
let Schema = mongoose.Schema;
const User = require("../Pay/User");

let EquitySchemas = new Schema({
  public_key: {
    type: String,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  },
  equity: {
    type: Schema.Types.Decimal128,
  },
  bonus_equity: {
    type: Schema.Types.Decimal128,
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

let UserEquity = mongoose.model("user_equity", EquitySchemas);
module.exports = UserEquity;
