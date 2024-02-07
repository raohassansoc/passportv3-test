let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let RestaurantCategorySchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Restaurant Category Name."],
    minLength: [
      2,
      "Restaurant Category name Must be atleast 2 characters long.",
    ],
    maxLength: [
      50,
      "Restaurant Category name must be atmost 50 chracters long.",
    ],
  },
  description: {
    type: String,
    minLength: [
      5,
      "Restaurant Category Description Must be atleast 5 characters long.",
    ],
    maxLength: [
      100,
      "Restaurant Category Description must be atmost 100 chracters long.",
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

RestaurantCategorySchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let RestaurantCategory = mongoose.model(
  "restaurant_category",
  RestaurantCategorySchema
);
module.exports = RestaurantCategory;
