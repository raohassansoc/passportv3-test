let mongoose = require("mongoose");
const BusinessCategory = require("./BusinessCategory");
const Location = require("./Location");
const RealEstate = require("./RealEstate");
const Country = require("../Master/Country");
let Schema = mongoose.Schema;

let BusinessSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Business Name."],
    minLength: [2, "Business name Must be atleast 2 characters long."],
    maxLength: [200, "Business name must be atmost 200 chracters long."],
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: BusinessCategory,
    required: [true, "Business Category Data required for Business details."],
  },
  business_primary_contact_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Country,
    required: [
      true,
      "Contact Code required for Primary contact Number of Business.",
    ],
  },
  business_primary_contact_number: {
    type: Number,
    required: [true, "Primary contact Number of Business Required."],
  },
  business_secondary_contact_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Country,
  },
  business_secondary_contact_number: {
    type: Number,
  },
  business_email_id: {
    type: String,
    required: [true, "Business Email Details required."],
  },
  contact_person_name: {
    type: String,
  },
  contact_person_primary_contact_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Country,
  },
  contact_person_primary_contact_number: {
    type: Number,
  },
  contact_person_secondary_contact_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Country,
  },
  contact_person_secondary_contact_number: {
    type: Number,
  },
  contact_person_email_id: {
    type: String,
  },
  location_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Location,
  },
  real_estate_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: RealEstate,

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

BusinessSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let Business = mongoose.model("business", BusinessSchema);
module.exports = Business;
