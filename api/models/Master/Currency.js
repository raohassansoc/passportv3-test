let mongoose = require("mongoose");
let Schema = mongoose.Schema;
const CurrencyCategory = require("./CurrencyCategory");

let CurrencySchema = new Schema({
  currency_code: {
    type: String,
    required: [true, "Please Provide Currency Code."],
    minLength: [2, "Currency  name Must be at least 2 characters long."],
    maxLength: [10, "Currency  name must be at most 10 characters long."],
  },
  currency_name: {
    type: String,
  },
  currency_address: {
    type: String,
  },
  currency_category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: CurrencyCategory,
  },
  currency_abi: {
    type: String,
  },
  currency_icon: {
    type: String,
  },
  network: {
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

CurrencySchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let Currency = mongoose.model("currency", CurrencySchema);
module.exports = Currency;
