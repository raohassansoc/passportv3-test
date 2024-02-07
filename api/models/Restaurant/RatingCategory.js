let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let RatingCategorySchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Rating Category Name."],
    minLength: [2, "Rating Category name Must be atleast 2 characters long."],
    maxLength: [50, "Rating Category name must be atmost 50 chracters long."],
  },
  description: {
    type: String,
    minLength: [
      5,
      "Rating Category Description Must be atleast 5 characters long.",
    ],
    maxLength: [
      100,
      "Rating Category Description must be atmost 100 chracters long.",
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

RatingCategorySchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let RatingCategory = mongoose.model("rating_category", RatingCategorySchema);
module.exports = RatingCategory;
