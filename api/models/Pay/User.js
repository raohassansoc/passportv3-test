let mongoose = require("mongoose");
const Country = require("../Master/Country");
const City = require("../Master/City");
const Province = require("../Master/Province");
let Schema = mongoose.Schema;

let UsersSchema = new Schema({
  public_key: {
    type: String,
  },
  status: {
    type: String,
    default: null,
  },
  first_name: {
    type: String,
    default: null,
  },
  last_name: {
    type: String,
    default: null,
  },
  email_id: {
    type: String,
    unique: [true, "Email ID already exists."],
  },
  profile_picture: {
    type: String,
    default: "",
  },
  hashed_pin: {
    type: String,
    required: true,
    default: "null",
  },
  primary_contact_number: {
    type: Number,
    default: null,
  },
  dob: {
    type: Date,
    default: null,
  },
  address_line_1: {
    type: String,
  },
  address_line_2: {
    type: String,
  },
  city_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Country,
  },
  province_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Country,
  },
  country_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Country,
  },
  postal_code: {
    type: String,
  },
  telegram_id: {
    type: String,
    default: null,
  },
  instagram_id: {
    type: String,
    default: null,
  },
  bio: {
    type: String,
    default: null,
  },
  username: {
    type: String,
    default: null,
  },
  is_investor: {
    type: Boolean,
    default: false,
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
UsersSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});
let Users = mongoose.model("users", UsersSchema);
module.exports = Users;
