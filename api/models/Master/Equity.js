let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let EquitySchemas = new Schema({
  total_equity: {
    type: Schema.Types.Decimal128,
    default: 100,
  },
  total_value: {
    type: Schema.Types.Decimal128,
  },
  available_equity: {
    type: Schema.Types.Decimal128,
  },
  reserved_equity: {
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

let MasterEquity = mongoose.model("master_equity", EquitySchemas);
module.exports = MasterEquity;
