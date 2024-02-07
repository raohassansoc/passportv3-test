let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let DiscountTypeSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Discount Type Name."],
    minLength: [2, "Discount Type name Must be atleast 2 characters long."],
    maxLength: [50, "Discount Type name must be atmost 50 chracters long."],
  },
  description: {
    type: String,
    minLength: [
      5,
      "Discount Type Description Must be atleast 5 characters long.",
    ],
    maxLength: [
      100,
      "Discount Type Description must be atmost 100 chracters long.",
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

DiscountTypeSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let DiscountType = mongoose.model("discount_type", DiscountTypeSchema);
module.exports = DiscountType;
