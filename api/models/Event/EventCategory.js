let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let EventCategorySchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Event Category Name."],
    minLength: [2, "Event Category name Must be atleast 2 characters long."],
    maxLength: [50, "Event Category name must be atmost 50 chracters long."],
  },
  description: {
    type: String,
    minLength: [
      5,
      "Event Category Description Must be atleast 5 characters long.",
    ],
    maxLength: [
      100,
      "Event Category Description must be atmost 100 chracters long.",
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

EventCategorySchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let EventCategory = mongoose.model("event_category", EventCategorySchema);
module.exports = EventCategory;
