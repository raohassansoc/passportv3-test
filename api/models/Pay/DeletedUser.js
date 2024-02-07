let mongoose = require("mongoose");
const Country = require("../Master/Country");
let Schema = mongoose.Schema;

let DeletedUsersSchema = new Schema({
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
  country_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Country,
    default: null,
  },
  telegram_id: {
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
DeletedUsersSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});
let DeletedUsers = mongoose.model("deleted_users", DeletedUsersSchema);
module.exports = DeletedUsers;
