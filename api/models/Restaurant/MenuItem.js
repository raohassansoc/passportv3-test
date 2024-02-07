let mongoose = require("mongoose");
const MenuItemCategory = require("./MenuItemCategory");
const Restaurant = require("./Restaurant");
const Currency = require("../Master/Currency");
const Cuisine = require("./Cuisine");
let Schema = mongoose.Schema;

let MenuItemSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Menu Item Name."],
  },
  description: {
    type: String,
  },
  cuisine_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Cuisine,
  },
  thumbnail_image: {
    type: String,
  },
  images: {
    type: [String],
  },
  ingrediants: {
    type: [String],
  },
  is_vegetarian: {
    type: Boolean,
    default: true,
  },
  restaurant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Restaurant,
    required: [true, "Restaurant Reference Required to add Menu Item."],
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MenuItemCategory,
    required: [true, "Menu Item Category Required to add Menu Item."],
  },
  price: {
    type: Number,
    required: [true, "Please Provide Price of Menu Item."],
  },
  currency_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Currency,
    required: [true, "Currency Type required for Price of Menu Item."],
  },
  is_served_during_breakfast: {
    type: Boolean,
    default: false,
  },
  is_served_during_brunch: {
    type: Boolean,
    default: false,
  },
  is_served_during_lunch: {
    type: Boolean,
    default: false,
  },
  is_served_during_refreshment: {
    type: Boolean,
    default: false,
  },
  is_served_during_dinner: {
    type: Boolean,
    default: false,
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

MenuItemSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let MenuItem = mongoose.model("menu_item", MenuItemSchema);
module.exports = MenuItem;
