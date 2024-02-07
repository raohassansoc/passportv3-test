let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let EventHostCategorySchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Event Host Category Name."],
    minLength: [
      2,
      "Event Host Category name Must be atleast 2 characters long.",
    ],
    maxLength: [
      50,
      "Event Host Category name must be atmost 50 chracters long.",
    ],
  },
  description: {
    type: String,
    minLength: [
      5,
      "Event Host Category Description Must be atleast 5 characters long.",
    ],
    maxLength: [
      100,
      "Event Host Category Description must be atmost 100 chracters long.",
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

EventHostCategorySchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let EventHostCategory = mongoose.model(
  "event_host_category",
  EventHostCategorySchema
);
module.exports = EventHostCategory;
