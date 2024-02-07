let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let IndustryTypeSchema = new Schema({
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

IndustryTypeSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let IndustryType = mongoose.model("industry_type", IndustryTypeSchema);
module.exports = IndustryType;
