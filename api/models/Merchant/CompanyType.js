let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let CompanyTypeSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Company Type."],
    unique: [true, "Company Type already exists."],
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

CompanyTypeSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let CompanyType = mongoose.model("company_type", CompanyTypeSchema);
module.exports = CompanyType;
