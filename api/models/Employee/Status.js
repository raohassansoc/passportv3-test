let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let StatusSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Employee Status Name."],
    minLength: [2, "Employee Status name Must be atleast 2 characters long."],
    maxLength: [50, "Employee Status name must be atmost 50 chracters long."],
  },
  description: {
    type: String,
    minLength: [
      2,
      "Employee Status Description Must be atleast 2 characters long.",
    ],
    maxLength: [
      100,
      "Employee Status Description must be atmost 100 chracters long.",
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

StatusSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let Status = mongoose.model("employee_status", StatusSchema);
module.exports = Status;
