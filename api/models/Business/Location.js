let mongoose = require("mongoose");
const Country = require("../Master/Country");
const City = require("../Master/City");
const Province = require("../Master/Province");
let Schema = mongoose.Schema;

let LocationSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please Provide Location Name."],
    minLength: [2, "Location name Must be atleast 2 characters long."],
    maxLength: [50, "Location name must be atmost 50 chracters long."],
  },
  local_name: {
    type: String,
  },
  street_name: {
    type: String,
  },
  address_line_1: {
    type: String,
  },
  address_line_2: {
    type: String,
  },
  city_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: City,
    required: [true, "City Data required for Location details."],
  },
  province_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Province,
    required: [true, "Province Data required for Location details."],
  },
  country_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Country,
    required: [true, "Country Data required for Location details."],
  },
  zipcode: {
    type: String,
    required: [true, "ZipCode/PostalCode required for Location details."],
  },
  contact_number: {
    type: Number,
    required: [true, "Contact required for Location details."],
  },
  contact_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Country,
    required: [true, "Contact Code required for Location details."],
  },
  email_id: {
    type: String,
  },
  latitude: {
    type: String,
  },
  longitude: {
    type: String,
  },
  description: {
    type: String,
  },
  thumbnail_image: {
    type: String,
  },
  images: {
    type: [String],
  },
  location_googlemaps_link: {
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

LocationSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

let Location = mongoose.model("location", LocationSchema);
module.exports = Location;
