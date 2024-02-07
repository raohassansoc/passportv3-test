let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let MerchantStatusSchemas = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Merchant Status Name."],
    minLength: [2, "Merchant Status name Must be atleast 2 characters long."],
    maxLength: [50, "Merchant Status name must be atmost 50 chracters long."],
  },
  description: {
    type: String,
    required: [true, "Please Provide Merchant Status Description."],
    minLength: [
      5,
      "Merchant Status Description Must be atleast 5 characters long.",
    ],
    maxLength: [
      100,
      "Merchant Status Description must be atmost 100 chracters long.",
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

MerchantStatusSchemas.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let MerchantStatus = mongoose.model("merchant_status", MerchantStatusSchemas);
module.exports = MerchantStatus;
