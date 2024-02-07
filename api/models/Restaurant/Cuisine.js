let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let CuisineSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Cuisine Name."],
    unique: [true, "Cuisine with this name already exists."],
  },
  description: {
    type: String,
  },
  origin: {
    type: [String],
  },
  key_ingredients: {
    type: [String],
  },
  cooking_method: {
    type: [String],
  },
  serving_style: {
    type: [String],
  },
  spice_level: {
    type: String,
  },
  seasonality: {
    type: [String],
  },
  presentation_style: {
    type: [String],
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

CuisineSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let Cuisine = mongoose.model("cuisine", CuisineSchema);
module.exports = Cuisine;
