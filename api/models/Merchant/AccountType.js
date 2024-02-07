let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let AccountTypeSchema = new Schema({
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

AccountTypeSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let AccountType = mongoose.model("merchant_account_type", AccountTypeSchema);
module.exports = AccountType;
