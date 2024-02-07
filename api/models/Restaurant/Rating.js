let mongoose = require("mongoose");
const RatingCategory = require("./RatingCategory");
const Restaurant = require("./Restaurant");
let Schema = mongoose.Schema;

let RatingSchema = new Schema({
  comment: {
    type: String,
    requied: [true, "Please Provide Rating Comment."],
  },
  description: {
    type: [String],
  },
  restaurant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Restaurant,
    required: [true, "Please Provide Restaurant Reference for Rating details."],
  },
  rating_category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: RatingCategory,
    required: [
      true,
      "Please Provide Rating Category Reference for Rating Details",
    ],
  },
  rating: {
    type: Number,
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

RatingSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let Rating = mongoose.model("rating", RatingSchema);
module.exports = Rating;
