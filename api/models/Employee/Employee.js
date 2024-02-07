let mongoose = require("mongoose");
const Status = require("./Status");
const Designation = require("./Designation");
const Restaurant = require("../Restaurant/Restaurant");
const Country = require("../Master/Country");
const City = require("../Master/City");
const Province = require("../Master/Province");
let Schema = mongoose.Schema;

let EmployeeSchema = new Schema({
  first_name: {
    type: String,
    required: [true, "Please Provide Employee First Name."],
  },
  last_name: {
    type: String,
    default: null,
  },
  email_id: {
    type: String,
    unique: [true, "Email ID already exists."],
    required: [true, "Please Provide Employee Email Id."],
  },
  profile_picture: {
    type: String,
  },
  password: {
    type: String,
  },
  dob: {
    type: Date,
    default: null,
  },
  contact_code_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Country,
    required: [true, "Please Provide Employee Contact Code Reference."],
  },
  contact_number: {
    type: Number,
    required: [true, "Please Provide Employee Contact Number."],
  },
  status_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Status,
    required: [true, "Please Provide Employee Status."],
  },
  designation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Designation,
    required: [true, "Please Provide Employee Designation."],
  },
  restaurant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Restaurant,
    required: [true, "Please Provide Employee Restaurant Reference."],
  },
  city_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: City,
  },
  province_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Province,
  },
  country_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Country,
    required: [true, "Please Provide Employee Country."],
  },
  zipcode: {
    type: String,
  },
  identity_proof: {
    type: String,
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

EmployeeSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let Employee = mongoose.model("employee", EmployeeSchema);
module.exports = Employee;
