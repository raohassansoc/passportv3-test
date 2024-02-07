let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let TransactionStausSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Transaction Status Name."],
    minLength: [
      2,
      "Transaction Status name Must be atleast 2 characters long.",
    ],
    maxLength: [
      50,
      "Transaction Status name must be atmost 50 chracters long.",
    ],
  },
  description: {
    type: String,
    required: [true, "Please Provide Transaction Status Description."],
    minLength: [
      5,
      "Transaction Status Description Must be atleast 5 characters long.",
    ],
    maxLength: [
      100,
      "Transaction Status Description must be atmost 100 chracters long.",
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

TransactionStausSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let TransactionStatus = mongoose.model(
  "transaction_status",
  TransactionStausSchema
);
module.exports = TransactionStatus;
