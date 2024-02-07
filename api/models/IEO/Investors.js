let mongoose = require("mongoose");
const Country = require("../Master/Country");
let Schema = mongoose.Schema;

let InvestorsSchema = new Schema({
  public_key: {
    type: String,
  },
  status: {
    type: String,
  },
  first_name: {
    type: String,
  },
  last_name: {
    type: String,
  },
  email_id: {
    type: String,
    unique: [true, "Email ID already exists."],
  },
  primary_contact_number: {
    type: Number,
  },
  dob: {
    type: Date,
  },
  country_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Country,
  },
  telegram_id: {
    type: String,
  },
  is_minted: {
    type: Boolean,
    default: false,
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

let Investors = mongoose.model("investors", InvestorsSchema);
module.exports = Investors;
