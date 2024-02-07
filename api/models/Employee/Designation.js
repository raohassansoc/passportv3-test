let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let DesignationSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Employee Designation Name."],
    minLength: [
      2,
      "Employee Designation name Must be atleast 2 characters long.",
    ],
    maxLength: [
      50,
      "Employee Designation name must be atmost 50 chracters long.",
    ],
  },
  description: {
    type: String,
    minLength: [
      2,
      "Employee Designation Description Must be atleast 2 characters long.",
    ],
    maxLength: [
      100,
      "Employee Designation Description must be atmost 100 chracters long.",
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

DesignationSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let Designation = mongoose.model("employee_designation", DesignationSchema);
module.exports = Designation;
