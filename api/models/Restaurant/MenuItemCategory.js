let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let MenuItemCategorySchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Menu Item Category Name."],
    minLength: [
      2,
      "Menu Item Category name Must be atleast 2 characters long.",
    ],
    maxLength: [
      50,
      "Menu Item Category name must be atmost 50 chracters long.",
    ],
  },
  description: {
    type: String,
    minLength: [
      5,
      "Menu Item Category Description Must be atleast 5 characters long.",
    ],
    maxLength: [
      100,
      "Menu Item Category Description must be atmost 100 chracters long.",
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

MenuItemCategorySchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let MenuItemCategory = mongoose.model(
  "menu_item_category",
  MenuItemCategorySchema
);
module.exports = MenuItemCategory;
