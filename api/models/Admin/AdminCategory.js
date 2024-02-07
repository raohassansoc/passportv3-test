let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let AdminCategorySchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Admin Category Name."],
    minLength: [2, "Admin Category name Must be atleast 2 characters long."],
    maxLength: [50, "Admin Category name must be atmost 50 chracters long."],
  },
  description: {
    type: String,
    minLength: [
      5,
      "Admin Category Description Must be atleast 5 characters long.",
    ],
    maxLength: [
      100,
      "Admin Category Description must be atmost 100 chracters long.",
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

AdminCategorySchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let AdminCategory = mongoose.model("admin_category", AdminCategorySchema);
module.exports = AdminCategory;
