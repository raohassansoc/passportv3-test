let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let FiatTransactionTypeSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Fiat Transaction Type Name."],
    minLength: [
      2,
      "Fiat Transaction Type name Must be atleast 2 characters long.",
    ],
    maxLength: [
      50,
      "Fiat Transaction Type name must be atmost 50 chracters long.",
    ],
  },
  description: {
    type: String,
    required: [true, "Please Provide Fiat Transaction Type Description."],
    minLength: [
      5,
      "Fiat Transaction Type Description Must be atleast 5 characters long.",
    ],
    maxLength: [
      100,
      "Fiat Transaction Type Description must be atmost 100 chracters long.",
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

FiatTransactionTypeSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let FiatTransactionType = mongoose.model(
  "fiat_transaction_type",
  FiatTransactionTypeSchema
);
module.exports = FiatTransactionType;
