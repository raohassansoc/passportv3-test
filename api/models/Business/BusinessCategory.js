let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let BusinessCategorySchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Business Category Name."],
    minLength: [2, "Business Category name Must be atleast 2 characters long."],
    maxLength: [50, "Business Category name must be atmost 50 chracters long."],
  },
  description: {
    type: String,
    minLength: [
      5,
      "Business Category Description Must be atleast 5 characters long.",
    ],
    maxLength: [
      100,
      "Business Category Description must be atmost 100 chracters long.",
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

BusinessCategorySchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let BusinessCategory = mongoose.model(
  "business_category",
  BusinessCategorySchema
);
module.exports = BusinessCategory;
