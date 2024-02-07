let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let PropertyCategorySchemas = new Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
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

PropertyCategorySchemas.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let PropertyCategory = mongoose.model(
  "merchant_property_category",
  PropertyCategorySchemas
);
module.exports = PropertyCategory;
