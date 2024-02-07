let mongoose = require("mongoose");
let Schema = mongoose.Schema;
const Country = require("../Master/Country");
const AdminCategory = require("./AdminCategory");

let AdminSchema = new Schema({
  first_name: {
    type: String,
    required: [true, "First Name required for Admin SignUp."],
  },
  last_name: {
    type: String,
    required: [true, "Last Name required for Admin SignUp."],
  },
  admin_name: {
    type: String,
    required: [true, "Admin Name required for Admin SignUp."],
    unique: [true, "Admin with this admin name already exists."],
  },
  email_id: {
    type: String,
    unique: [true, "Admin with this Email ID already exists."],
    required: [true, "Email Id required for Admin SignUp."],
  },
  primary_contact_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Country,
  },
  primary_contact_number: {
    type: Number,
    unique: [true, "Admin with this Contact Number already exists."],
  },
  password: {
    type: String,
    required: [true, "Password required for Admin SignUp."],
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: AdminCategory,
    required: [true, "Admin Category required for Admin SignUp."],
  },
  is_deleted: {
    type: Boolean,
    default: false,
  },
  deleted_at: {
    type: Date,
    default: null,
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

AdminSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});
let Admin = mongoose.model("admin", AdminSchema);
module.exports = Admin;
