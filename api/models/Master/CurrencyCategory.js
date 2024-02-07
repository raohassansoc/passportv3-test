let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let CurrencyCategorySchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Currency Category Name."],
    minLength: [2, "Currency Category name Must be atleast 2 characters long."],
    maxLength: [50, "Currency Category name must be atmost 50 chracters long."],
  },
  description: {
    type: String,
    required: [true, "Please Provide Currency Category Description."],
    minLength: [
      5,
      "Currency Category Description Must be atleast 5 characters long.",
    ],
    maxLength: [
      100,
      "Currency Category Description must be atmost 100 chracters long.",
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

CurrencyCategorySchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let CurrencyCategory = mongoose.model(
  "currency_category",
  CurrencyCategorySchema
);
module.exports = CurrencyCategory;
