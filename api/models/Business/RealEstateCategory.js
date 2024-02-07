let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let RealEstateCategorySchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Real Estate Category Name."],
    minLength: [
      2,
      "Real Estate Category name Must be atleast 2 characters long.",
    ],
    maxLength: [
      50,
      "Real Estate Category name must be atmost 50 chracters long.",
    ],
  },
  description: {
    type: String,
    minLength: [
      5,
      "Real Estate Category Description Must be atleast 5 characters long.",
    ],
    maxLength: [
      100,
      "Real Estate Category Description must be atmost 100 chracters long.",
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

RealEstateCategorySchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let RealEstateCategory = mongoose.model(
  "real_estate_category",
  RealEstateCategorySchema
);
module.exports = RealEstateCategory;
